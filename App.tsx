import React, { useState, useEffect } from 'react';
import { ViewState, FortuneSlip, UserHistory, AppConfig } from './types';
import AdminPanel from './components/AdminPanel';
import FortuneSlipView from './components/FortuneSlip';
import { ShrineIcon } from './components/Icons';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { ref, onValue, set } from "firebase/database";

// --- Constants ---
const ADMIN_PASSCODE_DEFAULT = "takaramono"; 
// Sound effect for successful entry
const SOUND_ENTER_URL = "https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3";

const App = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>('LANDING');
  
  // Login Inputs
  const [email, setEmail] = useState('');
  const [userPasscodeInput, setUserPasscodeInput] = useState('');
  const [adminPasscodeInput, setAdminPasscodeInput] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Config Data
  const [currentMonth, setCurrentMonth] = useState('');
  const [config, setConfig] = useState<AppConfig>({ userPasscode: 'soba' });
  const [fortunes, setFortunes] = useState<FortuneSlip[]>([]);
  const [userHistory, setUserHistory] = useState<UserHistory[]>([]);
  
  // Transient State
  const [revealedFortune, setRevealedFortune] = useState<FortuneSlip | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Effects ---
  useEffect(() => {
    // 1. Initialize Date
    const date = new Date();
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(monthStr);

    if (!isFirebaseConfigured) {
        setIsLoading(false);
        return;
    }

    // 2. Realtime Listeners (Firebase)
    const fortunesRef = ref(db, 'fortunes');
    const configRef = ref(db, 'config');
    const historyRef = ref(db, 'history');

    const unsubscribeFortunes = onValue(fortunesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
             // Filter for current month client-side for simplicity, 
             // but we store all to keep history for admin
             const allFortunes: FortuneSlip[] = Array.isArray(data) ? data : Object.values(data);
             // We keep all fortunes in state so admin can see them, but filter for draw logic
             setFortunes(allFortunes);
        } else {
            setFortunes([]);
        }
        setIsLoading(false);
    });

    const unsubscribeConfig = onValue(configRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setConfig(data);
    });

    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setUserHistory(Array.isArray(data) ? data : []);
        } else {
            setUserHistory([]);
        }
    });

    return () => {
        unsubscribeFortunes();
        unsubscribeConfig();
        unsubscribeHistory();
    };
  }, []);

  // --- Helpers ---
  const saveFortunes = async (newFortunes: FortuneSlip[]) => {
    if (!isFirebaseConfigured) return;
    try {
        await set(ref(db, 'fortunes'), newFortunes);
    } catch (e) {
        console.error("Firebase Error", e);
        alert("Failed to save to cloud. Check internet connection.");
    }
  };

  const saveConfig = async (newConfig: AppConfig) => {
      if (!isFirebaseConfigured) return;
      try {
          await set(ref(db, 'config'), newConfig);
          // Optimistic update handled by listener, but we can set state too
          setConfig(newConfig);
      } catch (e) {
          console.error("Firebase Error", e);
          alert("Could not save settings. Storage might be full (image too large) or permission denied.");
      }
  };

  const getUserRecord = (email: string) => userHistory.find(u => u.email === email);

  // --- Handlers ---

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !userPasscodeInput.trim()) {
        alert("Please enter both email and passcode.");
        return;
    }

    if (userPasscodeInput !== config.userPasscode) {
        alert("Incorrect secret passcode.");
        return;
    }

    // Play Success Sound
    try {
        const audio = new Audio(SOUND_ENTER_URL);
        audio.volume = 0.4;
        audio.play().catch(err => console.log("Audio play blocked", err));
    } catch (e) {
        console.error("Audio error", e);
    }

    // Check history
    const record = getUserRecord(email);
    if (record && record.draws[currentMonth]) {
        // User played
        const slipId = record.draws[currentMonth];
        const slip = fortunes.find(f => f.id === slipId);
        
        if (slip) {
            setRevealedFortune(slip);
            setView('REVEAL');
            alert(`Welcome back, friend. You have already received your blessing for ${currentMonth}. Come back for your next blessing when the moon begins again. `);
        } else {
             // Fallback if slip was deleted
             alert("The spirits are confused. Your previous fortune was lost. Please see the shrine keeper.");
        }
    } else {
        // New user
        setView('SHRINE');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (adminPasscodeInput === ADMIN_PASSCODE_DEFAULT) {
          setView('ADMIN');
          setShowAdminLogin(false);
          setAdminPasscodeInput('');
      } else {
          alert("Invalid Admin Passcode");
      }
  };

  const handleDrawFortune = async () => {
    // Filter fortunes for this month only
    const monthlyFortunes = fortunes.filter(f => f.month === currentMonth);

    if (monthlyFortunes.length === 0) {
        alert("The shrine box feels empty... (No fortunes configured for this month)");
        return;
    }

    if (isShaking || isGlowing) return;

    // Animation Sequence
    setIsGlowing(true); // Light up
    
    setTimeout(() => {
        setIsShaking(true); // Start shaking
    }, 500);

    setTimeout(async () => {
        // Reveal
        setIsShaking(false);
        setIsGlowing(false);

        // Logic
        const randomIndex = Math.floor(Math.random() * monthlyFortunes.length);
        const drawn = monthlyFortunes[randomIndex];
        setRevealedFortune(drawn);

        // Save history to Firebase
        if (isFirebaseConfigured) {
            const newHistory = [...userHistory];
            let recordIndex = newHistory.findIndex(u => u.email === email);
            
            if (recordIndex === -1) {
                newHistory.push({ email, draws: { [currentMonth]: drawn.id } });
            } else {
                // We must clone the inner object to avoid mutation issues if we were using state directly without deep copy, 
                // but for simple array replace it's fine.
                newHistory[recordIndex] = {
                    ...newHistory[recordIndex],
                    draws: {
                        ...newHistory[recordIndex].draws,
                        [currentMonth]: drawn.id
                    }
                };
            }

            try {
                await set(ref(db, 'history'), newHistory);
            } catch(e) {
                console.error("Save history failed", e);
                // Continue showing result anyway
            }
        }

        setView('REVEAL');
    }, 2500);
  };

  // Helper Component for Logo
  const Logo = ({ size = "large", className = "" }: { size?: "small" | "large", className?: string }) => {
    if (config.customLogo) {
        return (
            <img 
                src={config.customLogo} 
                className={`object-contain ${size === 'small' ? 'h-14 w-auto' : 'h-64 md:h-96 w-auto'} drop-shadow-xl ${className}`} 
                alt="Shrine Logo" 
            />
        );
    }
    return <ShrineIcon className={`${size === 'small' ? 'w-14 h-14' : 'w-64 h-64 md:w-96 md:h-96'} text-farm-red opacity-90 drop-shadow-xl ${className}`} />;
  };

  // --- Render: Configuration Check ---
  if (!isFirebaseConfigured) {
      return (
        <div className="min-h-screen bg-farm-bg flex items-center justify-center p-8 font-sans">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-farm-border max-w-lg text-center space-y-6">
                <div className="w-16 h-16 bg-farm-red/10 rounded-full flex items-center justify-center mx-auto text-3xl">⚙️</div>
                <h1 className="text-2xl font-bold text-farm-dark font-heading">Database Setup Required</h1>
                <p className="text-farm-gray leading-relaxed">
                    To sync the shrine across all devices, you must connect a database.
                </p>
                <div className="bg-farm-bg p-4 rounded-xl text-left text-sm space-y-2 text-farm-dark/80">
                    <p>1. Open <b>firebaseConfig.ts</b> in your project.</p>
                    <p>2. Create a free project at <a href="https://console.firebase.google.com" target="_blank" className="text-farm-red underline font-bold">console.firebase.google.com</a>.</p>
                    <p>3. Create a <b>Realtime Database</b> in "Test Mode".</p>
                    <p>4. Copy the project config keys into the file.</p>
                </div>
                <button onClick={() => window.location.reload()} className="w-full py-3 bg-farm-dark text-white rounded-xl font-bold hover:bg-black transition-colors">
                    I have updated the file
                </button>
            </div>
        </div>
      );
  }

  // --- Render: Loading ---
  if (isLoading) {
      return (
          <div className="min-h-screen bg-farm-bg flex items-center justify-center font-sans">
              <div className="animate-pulse flex flex-col items-center gap-4">
                  <ShrineIcon className="w-16 h-16 text-farm-gray/30" />
                  <span className="text-farm-gray font-bold tracking-widest text-xs uppercase">Connecting to Shrine...</span>
              </div>
          </div>
      )
  }

  // --- Render: Admin ---
  if (view === 'ADMIN') {
    return (
        <AdminPanel 
            currentFortunes={fortunes} 
            onUpdateFortunes={saveFortunes} 
            currentConfig={config}
            onUpdateConfig={saveConfig}
            onClose={() => setView('LANDING')} 
        />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-farm-bg font-sans text-farm-dark">
      
      {/* Background Decor - Organic Blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-white rounded-full mix-blend-soft-light filter blur-3xl opacity-80"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#E8E4D5] rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
         <div className="absolute top-[40%] left-[10%] w-32 h-32 bg-farm-green rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Header */}
      <header className="z-10 w-full p-6 md:p-10 flex justify-between items-center max-w-6xl mx-auto">
         <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('LANDING')}>
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-farm-border group-hover:scale-105 transition-transform">
                <Logo size="small" />
            </div>
            {/* Header Title: Smaller on mobile, medium on desktop, always smaller than main title */}
            <span className="font-dokdo font-bold text-2xl md:text-4xl text-farm-dark tracking-wide pt-1">Kaya's Village Shrine</span>
         </div>
         <div className="flex gap-4 items-center">
             <div className="bg-white/60 px-4 py-2 rounded-full text-xs text-farm-gray font-bold hidden md:block border border-farm-border">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
             </div>
             {view === 'LANDING' && (
                 <button 
                    onClick={() => setShowAdminLogin(true)}
                    className="text-[10px] uppercase tracking-wider text-farm-gray/50 hover:text-farm-gray transition-colors font-bold px-2 py-1"
                 >
                    Admin
                 </button>
             )}
         </div>
      </header>

      {/* Main Content Area - Increased side padding for mobile */}
      <main className="z-10 flex-1 flex flex-col items-center justify-center w-full max-w-xl px-8 md:px-4 pb-24">
        
        {/* LANDING VIEW */}
        {view === 'LANDING' && (
            // Increased space-y for mobile
            <div className="text-center space-y-16 md:space-y-12 animate-fade-in w-full">
                <div className="flex flex-col items-center space-y-10 md:space-y-8">
                    {/* Replaced white box with transparent container and larger logo */}
                    <div className="p-4 relative z-10 transform hover:scale-105 transition-transform duration-700">
                        <Logo size="large" />
                    </div>
                    <div>
                        {/* Main Title: 
                            - Mobile: text-6xl, 2 lines (via <br md:hidden>)
                            - Desktop: text-8xl/9xl, 1 line
                        */}
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-dokdo font-bold text-farm-dark tracking-wide mb-6 md:mb-4 leading-[0.8] md:leading-none">
                            Kaya's <br className="md:hidden" />Village Shrine
                        </h1>
                        <p className="text-farm-gray max-w-sm mx-auto leading-relaxed text-base font-medium">
                            With each new moon, the shrine refreshes its blessings.
                            This is where the one meant for you awaits.
                            <br />
                            <br />
                            Enter your email and this month's secret passcode to enter the shrine.
                        </p>
                    </div>
                </div>
                
                <form onSubmit={handleUserLogin} className="flex flex-col gap-5 items-center w-full max-w-sm mx-auto bg-white p-8 rounded-[2.5rem] border border-farm-border shadow-lg shadow-farm-border/40">
                    <div className="w-full space-y-2 text-left">
                        <label className="text-xs uppercase tracking-widest text-farm-gray font-bold ml-4">Email</label>
                        <input 
                            type="email" 
                            required 
                            placeholder="villager@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-4 bg-farm-bg border-2 border-transparent focus:border-farm-red/30 rounded-full outline-none transition-all text-farm-dark placeholder-farm-gray/50 font-medium text-center hover:bg-farm-bg/80"
                        />
                    </div>
                    
                    <div className="w-full space-y-2 text-left">
                        <label className="text-xs uppercase tracking-widest text-farm-gray font-bold ml-4">Secret Passcode</label>
                        <input 
                            type="password" 
                            required 
                            placeholder="••••"
                            value={userPasscodeInput}
                            onChange={(e) => setUserPasscodeInput(e.target.value)}
                            className="w-full px-6 py-4 bg-farm-bg border-2 border-transparent focus:border-farm-red/30 rounded-full outline-none transition-all text-farm-dark placeholder-farm-gray/50 font-medium text-center hover:bg-farm-bg/80"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full mt-4 px-8 py-5 bg-farm-dark text-white rounded-full font-bold tracking-wide hover:bg-black hover:scale-[1.02] transform transition-all shadow-xl"
                    >
                        Enter Shrine
                    </button>
                </form>
            </div>
        )}

        {/* ADMIN LOGIN MODAL */}
        {showAdminLogin && (
            <div className="fixed inset-0 bg-farm-dark/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl animate-fade-in-up border border-farm-border">
                    <h3 className="text-xl font-heading font-bold text-farm-dark mb-6 text-center">Shrine Keeper Access</h3>
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <input 
                            type="password" 
                            autoFocus
                            placeholder="Admin Passcode"
                            className="w-full px-6 py-4 bg-farm-bg border-2 border-transparent focus:border-farm-red/30 rounded-full outline-none text-center font-medium text-farm-dark"
                            value={adminPasscodeInput}
                            onChange={(e) => setAdminPasscodeInput(e.target.value)}
                        />
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 px-4 py-3 text-farm-gray hover:bg-farm-bg rounded-full transition-colors font-bold text-sm">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-3 bg-farm-red text-white rounded-full hover:bg-farm-red-dark transition-colors shadow-lg font-bold text-sm">Login</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* SHRINE VIEW */}
        {view === 'SHRINE' && (
            <div className="flex flex-col items-center space-y-16 animate-fade-in w-full">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-heading font-bold text-farm-dark">The Blessing Box</h2>
                    <p className="text-farm-gray font-medium max-w-xs mx-auto">Take a deep breath and tap the box. Only one slip will answer.</p>
                </div>

                {/* The Box */}
                <button 
                    onClick={handleDrawFortune}
                    disabled={isShaking || isGlowing}
                    className="group relative focus:outline-none"
                    aria-label="Draw Fortune Slip"
                >
                    <div className={`
                        relative w-64 h-80 bg-farm-red rounded-[3rem] border-[8px] border-white flex items-center justify-center shadow-2xl transition-all duration-300
                        ${isShaking ? 'animate-[shake_0.5s_ease-in-out_infinite]' : 'hover:-translate-y-3 hover:shadow-3xl'}
                        ${isGlowing ? 'animate-glow shadow-farm-red/50' : 'shadow-farm-red/20'}
                    `}>
                         {/* Box Detail */}
                         <div className="w-48 h-64 bg-white/10 border-2 border-white/20 relative shadow-inner overflow-hidden flex flex-col items-center justify-center rounded-[2rem] backdrop-blur-sm">
                            {/* Hexagon shape hint */}
                            <div className="absolute top-6 w-16 h-16 border-4 border-white/20 rounded-full"></div>
                            
                            <span className="text-7xl text-white/90 select-none font-heading mt-2">吉</span>
                            
                            {/* Slot */}
                            <div className={`absolute bottom-8 w-20 h-3 bg-black/20 rounded-full transition-all duration-300 ${isGlowing ? 'w-24 bg-white shadow-[0_0_20px_white]' : ''}`}></div>
                         </div>
                         
                         {/* Glass/Shine Effect */}
                         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-[2.5rem] pointer-events-none"></div>
                    </div>
                    
                    {!isShaking && !isGlowing && (
                        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-farm-gray text-xs font-bold tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap bg-white px-6 py-3 rounded-full shadow-lg border border-farm-border transform group-hover:-translate-y-2">
                            TAP THE BOX
                        </div>
                    )}
                </button>
            </div>
        )}

        {/* REVEAL VIEW */}
        {view === 'REVEAL' && revealedFortune && (
            <FortuneSlipView 
                fortune={revealedFortune} 
                onClose={() => setView('LANDING')}
            />
        )}
      </main>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg) translateY(2px); }
          50% { transform: rotate(3deg) translateY(-2px); }
          75% { transform: rotate(-3deg) translateY(2px); }
        }
        .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;