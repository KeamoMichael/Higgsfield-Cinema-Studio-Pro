
import React, { useState, useEffect, useRef } from 'react';
// Added missing Check icon import
import { Download, Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Image as ImageIcon, Check, Compass } from 'lucide-react';
import { Resolution } from '../types';

interface ImageDisplayProps {
  imageUrls: string[];
  referenceImage?: string | null;
  isLoading: boolean;
  modelName: string;
  resolution: Resolution;
  onGenerateAngles?: (imageUrl: string, imageIndex: number) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrls, referenceImage, isLoading, resolution, onGenerateAngles }) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFullyReady, setIsFullyReady] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const progressInterval = useRef<number | null>(null);

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `cinema-studio-pro-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetPreview = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const closePreview = () => {
    setPreviewUrl(null);
    resetPreview();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isLoading) {
      setDisplayProgress(0);
      setIsFullyReady(false);

      let estimatedSeconds = 12;
      if (resolution === Resolution._2K) estimatedSeconds = 18;
      if (resolution === Resolution._4K) estimatedSeconds = 25;

      const increment = 100 / (estimatedSeconds * 10);

      progressInterval.current = window.setInterval(() => {
        setDisplayProgress(prev => {
          if (prev >= 98) return 98;
          const slowFactor = prev > 80 ? 0.2 : 1;
          return Math.min(prev + increment * slowFactor, 98);
        });
      }, 100);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      if (imageUrls.length > 0) {
        setDisplayProgress(100);
        const timeout = setTimeout(() => setIsFullyReady(true), 400);
        return () => clearTimeout(timeout);
      } else {
        setDisplayProgress(0);
        setIsFullyReady(false);
      }
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isLoading, imageUrls, resolution]);

  const gridClass = imageUrls.length === 1 ? 'grid-cols-1' :
    imageUrls.length === 2 ? 'grid-cols-2' :
      'grid-cols-2';

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 h-full min-h-[400px]">

      <div className="relative w-full h-full max-h-[60vh] flex flex-col gap-4">

        {/* Floating Base/Reference Image Window */}
        {referenceImage && (imageUrls.length > 0 || isLoading) && (
          <div className="absolute -left-12 -top-12 lg:-left-20 lg:-top-20 z-40 animate-in fade-in zoom-in duration-700 delay-300">
            <div className="relative group">
              <div className="bg-[#121212]/90 backdrop-blur-2xl p-1.5 rounded-[1.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-[1rem] overflow-hidden">
                  <img src={referenceImage} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <ImageIcon size={10} />
                      Source Frame
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#c7ff00] text-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-[#121212]">
                <Check size={10} strokeWidth={4} />
              </div>
            </div>
          </div>
        )}

        {/* Unified Progress Bar */}
        {(isLoading || (displayProgress > 0 && displayProgress < 100) || (displayProgress === 100 && !isFullyReady)) && (
          <div className="absolute -top-8 left-0 w-full h-1 bg-white/5 z-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c7ff00] transition-all duration-300 ease-out shadow-[0_0_15px_rgba(199,255,0,0.5)]"
              style={{ width: `${displayProgress}%` }}
            ></div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-2 border-[#c7ff00]/20 border-t-[#c7ff00] rounded-full animate-spin mb-6"></div>
            <div className="text-[11px] font-black tracking-[0.4em] text-[#c7ff00] uppercase animate-pulse">
              {displayProgress < 98 ? 'Orchestrating Vision' : 'Finalizing Masterpiece'}
            </div>
          </div>
        )}

        {imageUrls.length > 0 && isFullyReady ? (
          <div className={`grid ${gridClass} gap-6 w-full h-full`}>
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-video bg-[#121212] rounded-[2rem] border border-white/5 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] group">
                <img
                  src={url}
                  alt={`Variation ${idx + 1}`}
                  className="w-full h-full object-cover animate-image-reveal transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 z-30">
                  <span className="text-[9px] font-black bg-black/40 backdrop-blur-md text-white/50 px-2 py-1 rounded-lg uppercase tracking-widest border border-white/5">
                    Frame 0{idx + 1}
                  </span>
                </div>

                {/* Top Right Expand Button */}
                <div className="absolute top-4 right-4 z-30 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <button
                    onClick={() => setPreviewUrl(url)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2a2a2a]/90 backdrop-blur-md text-[#d1d1d1] hover:text-white hover:bg-[#3a3a3a] border border-white/10 transition-all active:scale-95 shadow-xl"
                  >
                    <Maximize2 size={18} />
                  </button>
                </div>

                {/* Bottom Action Buttons */}
                <div className="absolute bottom-6 right-6 z-30 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                  {onGenerateAngles && (
                    <button
                      onClick={() => onGenerateAngles(url, idx)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/80 backdrop-blur-xl text-[#c7ff00] hover:bg-[#c7ff00] hover:text-black border border-[#c7ff00]/30 transition-all active:scale-95 shadow-lg group/btn"
                      title="Generate 4 Angles"
                    >
                      <Compass size={16} className="group-hover/btn:rotate-45 transition-transform duration-300" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(url)}
                    className="custom-gradient-btn w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-[0_10px_20px_rgba(199,255,0,0.4)]"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="w-full h-full bg-gradient-to-t from-black to-[#0a0a0a] rounded-[2.5rem] border border-white/5 flex items-center justify-center">
              <div className="relative flex flex-col items-center gap-6 opacity-10">
                <div className="w-32 h-32 rounded-full border border-white/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7m4 0h5m-2.5-2.5v5M9 11l3 3L22 4" />
                  </svg>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={closePreview} />

          <div className="relative w-full h-full flex flex-col items-center justify-center gap-8 pointer-events-none">

            {/* Image Container */}
            <div
              className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)] border border-white/10 pointer-events-auto cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={previewUrl}
                className="w-full h-full object-contain transition-transform duration-200 ease-out select-none"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                }}
                draggable={false}
              />
            </div>

            {/* Preview Controls Container */}
            <div className="flex items-center gap-6 pointer-events-auto bg-[#1a1a1a]/80 backdrop-blur-2xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setZoom(prev => Math.max(1, prev - 0.5))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  <ZoomOut size={18} />
                </button>

                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center min-w-[70px]">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Scale</span>
                  <span className="text-[14px] font-bold text-[#c7ff00]">{Math.round(zoom * 100)}%</span>
                </div>

                <button
                  onClick={() => setZoom(prev => Math.min(5, prev + 0.5))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  <ZoomIn size={18} />
                </button>
              </div>

              <div className="w-px h-8 bg-white/10" />

              <div className="flex items-center gap-3">
                <button
                  onClick={resetPreview}
                  className="flex items-center gap-2 px-4 h-10 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  <RotateCcw size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Reset</span>
                </button>

                <button
                  onClick={() => handleDownload(previewUrl)}
                  className="custom-gradient-btn flex items-center gap-2 px-6 h-10 rounded-xl font-black transition-all active:scale-95"
                >
                  <Download size={16} />
                  <span className="text-[11px] uppercase tracking-widest">Export</span>
                </button>

                <button
                  onClick={closePreview}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/5"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
