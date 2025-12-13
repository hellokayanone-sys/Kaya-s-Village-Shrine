import React, { useState, useRef } from 'react';
import { FortuneSlip, FortuneLevel, AppConfig } from '../types';
import { ImageIcon } from './Icons';

interface Props {
  currentFortunes: FortuneSlip[];
  onUpdateFortunes: (fortunes: FortuneSlip[]) => void;
  currentConfig: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<Props> = ({ currentFortunes, onUpdateFortunes, currentConfig, onUpdateConfig, onClose }) => {
  const [passcodeEdit, setPasscodeEdit] = useState(currentConfig.userPasscode);
  
  // Manual Entry State
  const [newLevel, setNewLevel] = useState<FortuneLevel>(FortuneLevel.Kichi);
  const [newPoem, setNewPoem] = useState('');
  const [newFocusOn, setNewFocusOn] = useState('');
  const [newDoingWell, setNewDoingWell] = useState('');
  
  // Advice State
  const [adviceLuck, setAdviceLuck] = useState('');
  const [adviceHappiness, setAdviceHappiness] = useState('');
  const [adviceStress, setAdviceStress] = useState('');
  const [adviceHealth, setAdviceHealth] = useState('');

  // File Upload State
  const logoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFortuneIdForUpload, setActiveFortuneIdForUpload] = useState<string | null>(null);

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSaveConfig = () => {
      onUpdateConfig({ ...currentConfig, userPasscode: passcodeEdit });
      alert("Settings updated!");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Size check (approx 500KB limit to be safe with LocalStorage)
      if (file.size > 500 * 1024) {
          alert("Logo image is too large. Please use a compressed image under 500KB.");
          if (logoInputRef.current) logoInputRef.current.value = '';
          return;
      }

      try {
        const base64 = await fileToBase64(file);
        onUpdateConfig({ ...currentConfig, customLogo: base64 });
      } catch (err) {
        alert("Failed to process logo image.");
      }
    }
    // Reset input
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemoveLogo = () => {
    if (confirm("Reset to default Shrine Icon?")) {
        onUpdateConfig({ ...currentConfig, customLogo: undefined });
    }
  };

  const handleAddFortune = () => {
    if (!newPoem || !newFocusOn || !newDoingWell || !adviceLuck) {
        alert("Please fill in at least the poem and main fields.");
        return;
    }

    const date = new Date();
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const newFortune: FortuneSlip = {
        id: `slip-${Date.now()}`,
        month: monthStr,
        level: newLevel,
        poem: newPoem,
        focusOn: newFocusOn,
        doingWell: newDoingWell,
        advice: {
            luck: adviceLuck,
            happiness: adviceHappiness,
            stress: adviceStress,
            health: adviceHealth
        }
    };

    onUpdateFortunes([...currentFortunes, newFortune]);
    
    // Reset Form
    setNewPoem('');
    setNewFocusOn('');
    setNewDoingWell('');
    setAdviceLuck('');
    setAdviceHappiness('');
    setAdviceStress('');
    setAdviceHealth('');
    alert("Fortune added to the box!");
  };

  const handleDelete = (id: string) => {
      if (confirm("Remove this fortune?")) {
          onUpdateFortunes(currentFortunes.filter(f => f.id !== id));
      }
  };

  const handleUploadClick = (id: string) => {
    setActiveFortuneIdForUpload(id);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear previous value
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeFortuneIdForUpload) {
        // Simple size check (approx 500KB limit to be safe with LocalStorage)
        if (file.size > 500 * 1024) {
            alert("Image file is too large. Please use a compressed image under 500KB.");
            return;
        }

        try {
            const base64 = await fileToBase64(file);
            const updated = currentFortunes.map(f => f.id === activeFortuneIdForUpload ? { ...f, imageUrl: base64 } : f);
            onUpdateFortunes(updated);
        } catch (err) {
            alert("Failed to upload image.");
        }
    }
  };

  const handleRemoveImage = (id: string) => {
      if (confirm("Remove this image?")) {
          const updated = currentFortunes.map(f => f.id === id ? { ...f, imageUrl: undefined } : f);
          onUpdateFortunes(updated);
      }
  };

  // Shared class for consistent input styling
  const inputClass = "w-full px-5 py-3 bg-white border border-farm-border rounded-xl text-sm focus:outline-none focus:border-farm-red focus:ring-4 focus:ring-farm-red/10 transition-all placeholder-farm-gray/50 text-farm-dark font-medium";
  const labelClass = "text-xs font-bold uppercase text-farm-gray block mb-2 ml-1 tracking-wider";

  return (
    <div className="fixed inset-0 bg-farm-bg/95 backdrop-blur-md z-50 overflow-y-auto p-4 md:p-8 font-sans text-farm-dark">
      <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] shadow-xl p-6 md:p-10 border border-farm-border/60">
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-farm-border/60">
            <div>
                <h2 className="text-3xl font-bold text-farm-dark font-heading">Shrine Admin Panel</h2>
                <p className="text-farm-gray mt-2 font-medium">Manage Kaya's Village Shrine settings.</p>
            </div>
            <button onClick={onClose} className="px-8 py-3 rounded-full border-2 border-farm-border text-farm-gray hover:bg-farm-bg hover:text-farm-dark transition-colors bg-white font-bold">Exit</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Config & Manual Entry */}
            <div className="space-y-8 lg:col-span-1">
                
                {/* Global Settings */}
                <div className="p-8 bg-farm-bg rounded-[2rem] border border-farm-border space-y-6">
                    <h3 className="font-bold text-lg text-farm-dark flex items-center gap-2 font-heading">
                        <span>⚙️</span> Shrine Settings
                    </h3>
                    
                    {/* Passcode Config */}
                    <div>
                        <label className={labelClass}>User Passcode</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={passcodeEdit}
                                onChange={(e) => setPasscodeEdit(e.target.value)}
                                className={`flex-1 ${inputClass}`}
                                placeholder="User Passcode"
                            />
                            <button 
                                onClick={handleSaveConfig}
                                className="px-6 py-3 bg-farm-dark text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg"
                            >
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <label className={labelClass}>Shrine Logo</label>
                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-farm-border">
                            <div className="w-16 h-16 bg-farm-bg rounded-xl flex items-center justify-center overflow-hidden border border-farm-border relative">
                                {currentConfig.customLogo ? (
                                    <img src={currentConfig.customLogo} className="w-full h-full object-contain" alt="Custom Logo" />
                                ) : (
                                    <span className="text-xs text-farm-gray font-bold">Default</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => logoInputRef.current?.click()}
                                    className="text-xs px-4 py-2 bg-farm-bg hover:bg-farm-border text-farm-dark rounded-lg font-bold transition-colors"
                                >
                                    Upload Logo
                                </button>
                                {currentConfig.customLogo && (
                                    <button onClick={handleRemoveLogo} className="text-[10px] text-farm-red hover:underline text-left px-1">
                                        Reset to Default
                                    </button>
                                )}
                                <input 
                                    type="file" 
                                    ref={logoInputRef} 
                                    className="hidden" 
                                    accept="image/png, image/jpeg" 
                                    onChange={handleLogoUpload}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Manual Entry Form */}
                <div className="p-8 bg-farm-bg rounded-[2rem] border border-farm-border shadow-sm">
                    <h3 className="font-bold text-lg text-farm-dark mb-6 flex items-center gap-2 font-heading">
                        <span>✍️</span> Add New Fortune
                    </h3>
                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>Fortune Level</label>
                            <select 
                                className={`${inputClass} appearance-none cursor-pointer`}
                                value={newLevel}
                                onChange={(e) => setNewLevel(e.target.value as FortuneLevel)}
                            >
                                {Object.values(FortuneLevel).map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className={labelClass}>Quote / Poem</label>
                            <textarea 
                                className={`${inputClass} h-28 resize-none leading-relaxed`}
                                placeholder="A gentle breeze..."
                                value={newPoem}
                                onChange={(e) => setNewPoem(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Focus More On</label>
                                <input 
                                    className={inputClass}
                                    placeholder="e.g. Family"
                                    value={newFocusOn}
                                    onChange={(e) => setNewFocusOn(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Doing Well In</label>
                                <input 
                                    className={inputClass}
                                    placeholder="e.g. Work"
                                    value={newDoingWell}
                                    onChange={(e) => setNewDoingWell(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t-2 border-farm-border/50 mt-2">
                            <label className={labelClass}>Guidance Aspects</label>
                            <input 
                                className={inputClass}
                                placeholder="Luck Advice"
                                value={adviceLuck}
                                onChange={(e) => setAdviceLuck(e.target.value)}
                            />
                            <input 
                                className={inputClass}
                                placeholder="Happiness Advice"
                                value={adviceHappiness}
                                onChange={(e) => setAdviceHappiness(e.target.value)}
                            />
                            <input 
                                className={inputClass}
                                placeholder="Stress Advice"
                                value={adviceStress}
                                onChange={(e) => setAdviceStress(e.target.value)}
                            />
                            <input 
                                className={inputClass}
                                placeholder="Health Advice"
                                value={adviceHealth}
                                onChange={(e) => setAdviceHealth(e.target.value)}
                            />
                        </div>

                        <button 
                            onClick={handleAddFortune}
                            className="w-full py-4 bg-farm-red text-white rounded-2xl hover:bg-farm-red-dark font-bold shadow-xl shadow-farm-red/20 transform hover:-translate-y-1 transition-all mt-6 text-lg"
                        >
                            Add to Box
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: List */}
            <div className="lg:col-span-2">
                <h3 className="font-bold text-farm-dark mb-6 font-heading text-xl">
                    Fortunes in Box ({currentFortunes.length})
                </h3>
                
                {currentFortunes.length === 0 && (
                    <div className="text-center p-16 bg-farm-bg rounded-[2.5rem] border-2 border-dashed border-farm-border">
                        <p className="text-farm-gray italic text-lg">No fortunes created for this month yet.</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 gap-6">
                    {currentFortunes.map((f) => (
                        <div key={f.id} className="border border-farm-border rounded-[2rem] p-6 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col md:flex-row gap-6 items-start group">
                            {/* Image Section */}
                            <div className="w-full md:w-44 flex-shrink-0 flex flex-col gap-3">
                                <div className="w-full aspect-square bg-farm-bg rounded-2xl flex items-center justify-center overflow-hidden border border-farm-border relative">
                                     {f.imageUrl ? (
                                        <>
                                            <img src={f.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Fortune illustration" />
                                            <button 
                                                onClick={() => handleRemoveImage(f.id)}
                                                className="absolute top-2 right-2 bg-white rounded-full p-1.5 text-farm-red shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                            </button>
                                        </>
                                     ) : (
                                        <span className="text-3xl opacity-30">📷</span>
                                     )}
                                </div>
                                <button 
                                    onClick={() => handleUploadClick(f.id)}
                                    className="w-full py-2.5 text-xs border border-farm-border bg-white rounded-xl hover:bg-farm-bg text-farm-gray font-bold flex items-center justify-center gap-2 transition-colors uppercase tracking-wide"
                                >
                                    <ImageIcon className="w-4 h-4"/> {f.imageUrl ? "Change" : "Upload"}
                                </button>
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 space-y-3 w-full">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-xs bg-farm-bg text-farm-red px-4 py-2 rounded-full uppercase tracking-widest border border-farm-border">{f.level}</span>
                                    <button onClick={() => handleDelete(f.id)} className="text-farm-border hover:text-farm-red w-8 h-8 flex items-center justify-center rounded-full hover:bg-farm-bg transition-colors">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    </button>
                                </div>
                                <p className="font-heading text-lg text-farm-dark pl-4 border-l-4 border-farm-green/30 italic py-1">"{f.poem}"</p>
                                
                                <div className="grid grid-cols-2 gap-3 text-xs text-farm-gray mt-2 bg-farm-bg p-4 rounded-2xl border border-farm-border">
                                    <div><b className="text-farm-dark">Luck:</b> {f.advice.luck}</div>
                                    <div><b className="text-farm-dark">Happy:</b> {f.advice.happiness}</div>
                                    <div><b className="text-farm-dark">Stress:</b> {f.advice.stress}</div>
                                    <div><b className="text-farm-dark">Health:</b> {f.advice.health}</div>
                                    <div className="col-span-2 pt-3 border-t border-farm-border mt-1 flex gap-4">
                                        <span className="flex items-center gap-1"><b className="text-farm-dark">Focus:</b> {f.focusOn}</span>
                                        <span className="flex items-center gap-1"><b className="text-farm-dark">Doing Well:</b> {f.doingWell}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg" 
        className="hidden" 
      />
    </div>
  );
};

export default AdminPanel;