import React, { useState } from 'react';
import { FortuneSlip as IFortuneSlip } from '../types';
import { ImageIcon, ArrowLeftIcon, ShareIcon } from './Icons';

// Add global declaration for html2canvas
declare const html2canvas: any;

interface Props {
  fortune: IFortuneSlip;
  onClose?: () => void;
}

const FortuneSlip: React.FC<Props> = ({ fortune, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveImage = async () => {
    setIsSaving(true);
    const element = document.getElementById('fortune-slip-container');
    if (element && typeof html2canvas !== 'undefined') {
      try {
        const canvas = await html2canvas(element, { 
            scale: 2, 
            backgroundColor: null,
            logging: false,
            useCORS: true // Help with external images if CORS allows
        });
        const link = document.createElement('a');
        link.download = `fortune-${fortune.month}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Save failed:", err);
        alert("Could not save image. You can try taking a screenshot.");
      }
    } else {
        window.print(); // Fallback
    }
    setIsSaving(false);
  };

  const handleShare = async () => {
      const text = `My Fortune for ${fortune.month}: ${fortune.level.split('(')[0]}\n"${fortune.poem}"\n\nVisit Kaya's Village Shrine to reveal yours.`;
      
      if (navigator.share) {
          try {
              await navigator.share({
                  title: "Kaya's Village Shrine",
                  text: text,
              });
          } catch (err) {
              // Share cancelled
          }
      } else {
          try {
            await navigator.clipboard.writeText(text);
            alert("Fortune text copied to clipboard!");
          } catch (e) {
            alert("Could not share automatically.");
          }
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up w-full max-w-2xl mx-auto py-8">
      {/* The Printable Slip Area */}
      <div 
        id="fortune-slip-container" 
        className="bg-white relative w-full p-8 md:p-12 shadow-2xl flex flex-col items-center text-center space-y-8 overflow-hidden rounded-[3rem] border border-farm-border/50"
        style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}
      >
        {/* Decorative Header */}
        <div className="absolute top-0 left-0 w-full h-4 bg-farm-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-farm-red rounded-b-2xl opacity-90" />
        
        <div className="mt-6 text-xs tracking-[0.4em] text-farm-gray uppercase font-bold">Omikuji</div>
        
        {/* Main Level */}
        <div className="relative">
            <h2 className="text-5xl md:text-6xl font-bold text-farm-red-dark mt-2 mb-2 tracking-widest relative z-10">
                {fortune.level.split('(')[1].replace(')', '')}
            </h2>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-farm-bg rounded-full -z-0 opacity-50 blur-xl"></div>
        </div>
        
        <p className="text-farm-gray uppercase text-sm tracking-widest font-bold">
            {fortune.level.split('(')[0]}
        </p>

        {/* Dynamic Illustration or Placeholder */}
        <div className="py-2">
             {fortune.imageUrl ? (
                <img src={fortune.imageUrl} alt={fortune.focusOn} className="w-72 h-72 object-contain rounded-[2rem] mix-blend-multiply" />
            ) : (
                 <div className="w-40 h-40 rounded-full border-4 border-farm-bg flex items-center justify-center text-farm-border bg-white">
                    <span className="text-6xl opacity-50">⛩️</span>
                 </div>
            )}
        </div>

        {/* Poem Content */}
        <div className="space-y-4 max-w-sm mx-auto">
            <p className="text-farm-dark leading-relaxed text-xl font-medium font-heading italic relative px-6">
                <span className="text-6xl text-farm-bg absolute -top-8 -left-2 font-serif select-none">“</span>
                {fortune.poem}
                <span className="text-6xl text-farm-bg absolute -bottom-10 -right-2 font-serif select-none">”</span>
            </p>
        </div>

        {/* Details Container */}
        <div className="w-full mt-8 bg-farm-bg p-8 rounded-[2.5rem] text-sm relative overflow-hidden">
            {/* Background pattern hint */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-soft-light filter blur-2xl opacity-50 pointer-events-none translate-x-10 -translate-y-10"></div>

            {/* Focus & Doing Well */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="text-center bg-white p-4 rounded-3xl border border-farm-border shadow-sm flex flex-col justify-center">
                    <span className="block text-farm-gray text-[10px] uppercase tracking-wider mb-2 font-bold">Focus On</span>
                    <span className="font-heading font-bold text-farm-dark text-lg">{fortune.focusOn}</span>
                 </div>
                 <div className="text-center bg-white p-4 rounded-3xl border border-farm-border shadow-sm flex flex-col justify-center">
                    <span className="block text-farm-gray text-[10px] uppercase tracking-wider mb-2 font-bold">Doing Well</span>
                    <span className="font-heading font-bold text-farm-dark text-lg">{fortune.doingWell}</span>
                 </div>
            </div>

            {/* Advice Grid */}
            <h4 className="text-center text-farm-gray text-xs uppercase tracking-wider mb-6 font-bold flex items-center justify-center gap-4">
                <span className="h-px w-8 bg-farm-border"></span>
                Level of Fortune
                <span className="h-px w-8 bg-farm-border"></span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {[
                    { label: 'Luck', val: fortune.advice.luck },
                    { label: 'Happiness', val: fortune.advice.happiness },
                    { label: 'Stress', val: fortune.advice.stress },
                    { label: 'Health', val: fortune.advice.health }
                ].map((item) => (
                    <div key={item.label} className="bg-white p-5 rounded-[1.5rem] border border-farm-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-farm-red font-bold block text-xs mb-2 uppercase tracking-wide">{item.label}</span>
                        <span className="text-farm-dark font-medium leading-relaxed">{item.val}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-5 right-10 text-[10px] text-farm-gray font-bold tracking-wide opacity-60">
            {fortune.month} • Kaya's Village Shrine
        </div>
      </div>

      {/* Actions (Not Printed) */}
      <div className="w-full max-w-md px-4 mt-10 no-print space-y-4">
        
        {/* Row 1: Save & Share */}
        <div className="flex gap-4">
            <button 
                onClick={handleSaveImage}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-5 bg-farm-dark text-white rounded-full hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 font-bold"
            >
                {isSaving ? (
                    <span className="animate-pulse">Saving...</span>
                ) : (
                    <>
                        <ImageIcon className="w-5 h-5" />
                        <span>Save Image</span>
                    </>
                )}
            </button>
            
            <button 
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-5 bg-white text-farm-dark border-2 border-farm-border rounded-full hover:bg-farm-bg transition-all shadow-md hover:shadow-lg font-bold"
            >
                <ShareIcon className="w-5 h-5" />
                <span>Share</span>
            </button>
        </div>

        {/* Gentle Reminder Text */}
        <p className="text-center text-xs text-farm-gray/80 italic font-medium px-4 py-2">
            Carry this with you for now. Another blessing will be waiting when the moon begins again.
        </p>

        {/* Row 2: Back */}
        {onClose && (
            <button 
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-6 py-5 bg-transparent text-farm-gray rounded-full hover:text-farm-dark hover:bg-white/50 transition-all font-bold text-sm"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Entrance</span>
            </button>
        )}
      </div>
    </div>
  );
};

export default FortuneSlip;