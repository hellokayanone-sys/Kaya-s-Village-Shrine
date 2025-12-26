import React, { useState } from 'react';
import { FortuneSlip as IFortuneSlip } from '../types';
import { ImageIcon, ArrowLeftIcon, ShareIcon } from './Icons';
import html2canvas from 'html2canvas';

interface Props {
  fortune: IFortuneSlip;
  onClose?: () => void;
}

const FortuneSlip: React.FC<Props> = ({ fortune, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveImage = async () => {
    setIsSaving(true);
    const element = document.getElementById('fortune-slip-container');
    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#FFFFFF',
          logging: false,
          useCORS: true,
          allowTaint: true,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById('fortune-slip-container');
            if (clonedElement) {
              // Remove decorative elements and borders for wallpaper
              clonedElement.style.borderRadius = '0';
              clonedElement.style.border = 'none';
              clonedElement.style.boxShadow = 'none';
              
              // Hide decorative header elements
              const decorativeElements = clonedElement.querySelectorAll('.absolute');
              decorativeElements.forEach(el => {
                if (!el.classList.contains('fortune-footer')) {
                  (el as HTMLElement).style.display = 'none';
                }
              });
              
              // Adjust padding to fit phone screen better
              clonedElement.style.padding = '20px 16px';
              
              // Slightly reduce spacing between elements
              const spaceElements = clonedElement.querySelectorAll('.space-y-8');
              spaceElements.forEach(el => {
                (el as HTMLElement).style.gap = '16px';
              });
              
              // Reduce image size slightly if needed
              const img = clonedElement.querySelector('img');
              if (img) {
                (img as HTMLElement).style.width = '300px';
                (img as HTMLElement).style.height = '300px';
              }
              
              // Reduce poem container padding
              const poem = clonedElement.querySelector('.fortune-poem');
              if (poem) {
                (poem as HTMLElement).style.padding = '15 15px';
                (poem as HTMLElement).style.fontSize = '18px';
              }
              
              // Reduce details container padding
              const details = clonedElement.querySelector('.fortune-details-container');
              if (details) {
                (details as HTMLElement).style.padding = '24px 24px';
                (details as HTMLElement).style.marginTop = '24px';
              }
              
              // Reduce advice item padding
              const adviceItems = details?.querySelectorAll('.advice-item');
              adviceItems?.forEach(item => {
                (item as HTMLElement).style.padding = '10px 10px';
                (item as HTMLElement).style.marginBottom = '8px';
              });
              
              // Reduce stat box padding
              const statBoxes = details?.querySelectorAll('.stat-box');
              statBoxes?.forEach(box => {
                (box as HTMLElement).style.padding = '12px 8px';
              });
            }
          }
        });
        
        const link = document.createElement('a');
        link.download = `fortune-wallpaper-${fortune.month}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
      } catch (err) {
        console.error("Save failed:", err);
        alert("Could not save image. Please try taking a screenshot.");
      }
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
        <div className="absolute top-0 left-0 w-full h-4 bg-farm-bg no-print" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-farm-red rounded-b-2xl opacity-90" />
        
        <div className="mt-6 text-xs tracking-[0.4em] text-farm-gray uppercase font-bold fortune-header-text">Omikuji</div>
        
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
        <div className="py-2 flex justify-center">
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
            <p className="fortune-poem text-farm-dark leading-relaxed text-xl font-medium font-heading italic relative px-6">
                <span className="text-6xl text-farm-bg absolute -top-8 -left-2 font-serif select-none opacity-40">"</span>
                {fortune.poem}
                <span className="text-6xl text-farm-bg absolute -bottom-10 -right-2 font-serif select-none opacity-40">"</span>
            </p>
        </div>

        {/* Details Container */}
        <div className="fortune-details-container w-full mt-8 bg-farm-bg p-8 rounded-[2.5rem] text-sm relative overflow-hidden">
            <h4 className="text-xs font-bold uppercase tracking-widest text-farm-gray mb-4">Guidance for this Moon</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6 stat-grid">
                <div className="stat-box bg-white p-4 rounded-2xl border border-farm-border/30">
                    <div className="text-[10px] font-bold text-farm-gray uppercase mb-1">Focus On</div>
                    <div className="text-farm-dark font-bold text-base">{fortune.focusOn}</div>
                </div>
                <div className="stat-box bg-white p-4 rounded-2xl border border-farm-border/30">
                    <div className="text-[10px] font-bold text-farm-gray uppercase mb-1">Doing Well</div>
                    <div className="text-farm-dark font-bold text-base">{fortune.doingWell}</div>
                </div>
            </div>

            <div className="space-y-3 text-left">
                <div className="advice-item bg-white/50 p-4 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">✨</span>
                    <div>
                        <b className="text-farm-dark block text-xs uppercase mb-1">Luck</b>
                        <p className="text-farm-gray leading-snug">{fortune.advice.luck}</p>
                    </div>
                </div>
                <div className="advice-item bg-white/50 p-4 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">🌱</span>
                    <div>
                        <b className="text-farm-dark block text-xs uppercase mb-1">Health</b>
                        <p className="text-farm-gray leading-snug">{fortune.advice.health}</p>
                    </div>
                </div>
                <div className="advice-item bg-white/50 p-4 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">😊</span>
                    <div>
                        <b className="text-farm-dark block text-xs uppercase mb-1">Happiness</b>
                        <p className="text-farm-gray leading-snug">{fortune.advice.happiness}</p>
                    </div>
                </div>
                <div className="advice-item bg-white/50 p-4 rounded-2xl flex items-start gap-3">
                    <span className="text-lg">🍃</span>
                    <div>
                        <b className="text-farm-dark block text-xs uppercase mb-1">Stress</b>
                        <p className="text-farm-gray leading-snug">{fortune.advice.stress}</p>
                    </div>
                </div>
            </div>

            <div className="fortune-footer mt-8 text-[10px] font-bold text-farm-gray/40 uppercase tracking-widest text-right">
                Kaya's Village Shrine • {fortune.month}
            </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-12 no-print">
        <button 
          onClick={onClose}
          className="p-5 rounded-full bg-white border-2 border-farm-border text-farm-gray hover:bg-farm-bg transition-colors shadow-lg group"
          title="Back"
        >
          <ArrowLeftIcon className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={handleSaveImage}
          disabled={isSaving}
          className="flex-1 px-8 py-5 bg-farm-dark text-white rounded-full font-bold shadow-xl shadow-farm-dark/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSaving ? (
              <span className="animate-pulse">Preparing...</span>
          ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                Save Wallpaper
              </>
          )}
        </button>
        <button 
          onClick={handleShare}
          className="p-5 rounded-full bg-farm-red text-white hover:bg-farm-red-dark transition-colors shadow-lg shadow-farm-red/20 active:scale-95"
          title="Share Fortune"
        >
          <ShareIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default FortuneSlip;