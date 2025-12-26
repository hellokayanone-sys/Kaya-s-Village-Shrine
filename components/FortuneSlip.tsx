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
        // Create a temporary wrapper with fixed phone dimensions
        const wrapper = document.createElement('div');
        wrapper.style.width = '1080px';
        wrapper.style.height = '1920px';
        wrapper.style.backgroundColor = '#FFFFFF';
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-10000px';
        wrapper.style.top = '0';
        wrapper.style.fontFamily = "'Zen Maru Gothic', sans-serif";
        
        // Clone and style the fortune slip for phone wallpaper
        const clonedElement = element.cloneNode(true) as HTMLElement;
        clonedElement.id = 'fortune-slip-wallpaper';
        
        // Reset all styles for consistent phone wallpaper
        clonedElement.style.width = '100%';
        clonedElement.style.height = '100%';
        clonedElement.style.maxWidth = 'none';
        clonedElement.style.padding = '60px 40px';
        clonedElement.style.margin = '0';
        clonedElement.style.backgroundColor = '#FFFFFF';
        clonedElement.style.borderRadius = '0';
        clonedElement.style.border = 'none';
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.display = 'flex';
        clonedElement.style.flexDirection = 'column';
        clonedElement.style.justifyContent = 'space-between';
        clonedElement.style.alignItems = 'center';
        clonedElement.style.textAlign = 'center';
        clonedElement.style.boxSizing = 'border-box';
        
        // Hide decorative elements
        const decorativeElements = clonedElement.querySelectorAll('.absolute');
        decorativeElements.forEach(el => {
          if (!el.classList.contains('fortune-footer')) {
            (el as HTMLElement).style.display = 'none';
          }
        });
        
        // Style header text
        const headerText = clonedElement.querySelector('.fortune-header-text');
        if (headerText) {
          (headerText as HTMLElement).style.fontSize = '24px';
          (headerText as HTMLElement).style.margin = '0 0 30px 0';
          (headerText as HTMLElement).style.letterSpacing = '8px';
        }
        
        // Style main level
        const mainLevel = clonedElement.querySelector('h2');
        if (mainLevel) {
          (mainLevel as HTMLElement).style.fontSize = '120px';
          (mainLevel as HTMLElement).style.margin = '20px 0';
          (mainLevel as HTMLElement).style.lineHeight = '1';
        }
        
        // Style level description
        const levelDesc = clonedElement.querySelector('p');
        if (levelDesc && !levelDesc.classList.contains('fortune-poem')) {
          (levelDesc as HTMLElement).style.fontSize = '28px';
          (levelDesc as HTMLElement).style.margin = '10px 0 40px 0';
        }
        
        // Style image - MUCH BIGGER
        const img = clonedElement.querySelector('img');
        if (img) {
          (img as HTMLElement).style.width = '320px';
          (img as HTMLElement).style.height = '320px';
          (img as HTMLElement).style.margin = '30px 0';
          (img as HTMLElement).style.borderRadius = '50px';
        }
        
        // Also handle the placeholder icon case - MUCH BIGGER
        const placeholderIcon = clonedElement.querySelector('div > span');
        if (placeholderIcon && !img) {
          const placeholderDiv = placeholderIcon.parentElement;
          if (placeholderDiv) {
            (placeholderDiv as HTMLElement).style.width = '320px';
            (placeholderDiv as HTMLElement).style.height = '320px';
            (placeholderDiv as HTMLElement).style.borderWidth = '8px';
            (placeholderIcon as HTMLElement).style.fontSize = '120px';
          }
        }
        
        // Style poem - WIDER for more words per line
        const poem = clonedElement.querySelector('.fortune-poem');
        if (poem) {
          (poem as HTMLElement).style.fontSize = '32px';
          (poem as HTMLElement).style.lineHeight = '1.4';
          (poem as HTMLElement).style.margin = '40px 0';
          (poem as HTMLElement).style.padding = '0 20px'; // Less padding for wider text
          (poem as HTMLElement).style.maxWidth = '950px'; // Much wider container
          (poem as HTMLElement).style.width = '100%';
          
          // Hide quote marks
          const quotes = poem.querySelectorAll('span');
          quotes.forEach(quote => {
            (quote as HTMLElement).style.display = 'none';
          });
        }
        
        // Style details container
        const details = clonedElement.querySelector('.fortune-details-container');
        if (details) {
          (details as HTMLElement).style.width = '100%';
          (details as HTMLElement).style.maxWidth = '1000px';
          (details as HTMLElement).style.margin = '40px 0 0 0';
          (details as HTMLElement).style.padding = '50px 40px';
          (details as HTMLElement).style.borderRadius = '60px';
          
          // Style section header
          const sectionHeader = details.querySelector('h4');
          if (sectionHeader) {
            (sectionHeader as HTMLElement).style.fontSize = '22px';
            (sectionHeader as HTMLElement).style.margin = '0 0 30px 0';
            (sectionHeader as HTMLElement).style.letterSpacing = '4px';
          }
          
          // Style stat grid
          const statGrid = details.querySelector('.stat-grid');
          if (statGrid) {
            (statGrid as HTMLElement).style.display = 'grid';
            (statGrid as HTMLElement).style.gridTemplateColumns = '1fr 1fr';
            (statGrid as HTMLElement).style.gap = '20px';
            (statGrid as HTMLElement).style.margin = '0 0 40px 0';
          }
          
          // Style stat boxes
          const statBoxes = details.querySelectorAll('.stat-box');
          statBoxes.forEach(box => {
            (box as HTMLElement).style.padding = '30px 20px';
            (box as HTMLElement).style.borderRadius = '30px';
            (box as HTMLElement).style.textAlign = 'center';
            
            const label = box.querySelector('div:first-child');
            const value = box.querySelector('div:last-child');
            
            if (label) {
              (label as HTMLElement).style.fontSize = '18px';
              (label as HTMLElement).style.marginBottom = '8px';
            }
            if (value) {
              (value as HTMLElement).style.fontSize = '26px';
              (value as HTMLElement).style.lineHeight = '1.2';
            }
          });
          
          // Style advice items
          const adviceItems = details.querySelectorAll('.advice-item');
          adviceItems.forEach(item => {
            (item as HTMLElement).style.padding = '25px 30px';
            (item as HTMLElement).style.margin = '15px 0';
            (item as HTMLElement).style.borderRadius = '30px';
            (item as HTMLElement).style.display = 'flex';
            (item as HTMLElement).style.alignItems = 'flex-start';
            (item as HTMLElement).style.gap = '20px';
            (item as HTMLElement).style.textAlign = 'left';
            
            const icon = item.querySelector('span:first-child');
            const content = item.querySelector('div');
            
            if (icon) {
              (icon as HTMLElement).style.fontSize = '32px';
              (icon as HTMLElement).style.flexShrink = '0';
            }
            
            if (content) {
              const label = content.querySelector('b');
              const text = content.querySelector('p');
              
              if (label) {
                (label as HTMLElement).style.fontSize = '20px';
                (label as HTMLElement).style.marginBottom = '8px';
                (label as HTMLElement).style.display = 'block';
              }
              if (text) {
                (text as HTMLElement).style.fontSize = '24px';
                (text as HTMLElement).style.lineHeight = '1.3';
                (text as HTMLElement).style.margin = '0';
              }
            }
          });
        }
        
        // Style footer
        const footer = clonedElement.querySelector('.fortune-footer');
        if (footer) {
          (footer as HTMLElement).style.position = 'absolute';
          (footer as HTMLElement).style.bottom = '30px';
          (footer as HTMLElement).style.right = '50px';
          (footer as HTMLElement).style.fontSize = '18px';
          (footer as HTMLElement).style.letterSpacing = '2px';
        }
        
        // Add to wrapper and document
        wrapper.appendChild(clonedElement);
        document.body.appendChild(wrapper);
        
        // Capture with html2canvas
        const canvas = await html2canvas(wrapper, {
          scale: 1,
          backgroundColor: '#FFFFFF',
          logging: false,
          useCORS: true,
          allowTaint: true,
          width: 1080,
          height: 1920
        });
        
        // Clean up
        document.body.removeChild(wrapper);
        
        // Download
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