
import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Monitor, Film, Sun, Camera, Palette, Check, X, Search, ChevronRight, Plus, RotateCcw, Layers, Copy, Zap, Box, Compass } from 'lucide-react';
import { Resolution, AspectRatio, CinematicParams, SelectionOption } from '../types';
import sparklesIcon from '../Assets/sparkles.png';
import {
  SHOT_TYPE_OPTIONS,
  ANGLE_OPTIONS,
  LIGHTING_OPTIONS,
  CAMERA_OPTIONS,
  LENS_OPTIONS,
  LENS_TYPE_OPTIONS,
  GENRE_OPTIONS,
  PHOTOGRAPHER_STYLE_OPTIONS,
  MOVIE_LOOK_OPTIONS,
  FILTER_OPTIONS,
  FILM_STOCK_OPTIONS
} from '../presets';

interface UnifiedChatBarProps {
  prompt: string;
  setPrompt: (v: string) => void;
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  numVariations: number;
  setNumVariations: (n: number) => void;
  isGenerating: boolean;
  onGenerate: (params: CinematicParams, attachments?: string[], specialMode?: 'consistent-angles') => void;
}

export const UnifiedChatBar: React.FC<UnifiedChatBarProps> = ({
  prompt,
  setPrompt,
  resolution,
  setResolution,
  aspectRatio,
  setAspectRatio,
  numVariations,
  setNumVariations,
  isGenerating,
  onGenerate,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectionView, setSelectionView] = useState<{ title: string, options: SelectionOption[], key: keyof CinematicParams } | null>(null);
  const [params, setParams] = useState<CinematicParams>({});
  const [isAspectRatioMenuOpen, setIsAspectRatioMenuOpen] = useState(false);
  const [isResolutionMenuOpen, setIsResolutionMenuOpen] = useState(false);
  const [isPromptMode, setIsPromptMode] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptModeRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const resMenuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: 'subject', icon: <Film size={18} />, label: 'Shot' },
    { id: 'lighting', icon: <Sun size={18} />, label: 'Lighting' },
    { id: 'camera', icon: <Camera size={18} />, label: 'Camera' },
    { id: 'style', icon: <Palette size={18} />, label: 'Style' }
  ];

  useEffect(() => {
    const textarea = isPromptMode ? promptModeRef.current : textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 180);
      textarea.style.height = `${newHeight}px`;
    }
  }, [prompt, isPromptMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setIsAspectRatioMenuOpen(false);
      if (resMenuRef.current && !resMenuRef.current.contains(target)) setIsResolutionMenuOpen(false);
      if (modalRef.current && !modalRef.current.contains(target)) {
        const toolButton = (target as HTMLElement).closest('[data-tool-id]');
        if (!toolButton) {
          setActiveModal(null);
          setSelectionView(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDirectorNote = () => {
    let directorNote = "";
    if (params.shotType || params.viewDirection) {
      const shot = params.shotType || "Master shot";
      const angle = params.viewDirection ? `at a ${params.viewDirection}` : "";
      directorNote += `${shot} ${angle}. `;
    }
    if (params.lightingSource || params.atmosphere) {
      const light = params.lightingSource || "Cinematic lighting";
      const mood = params.atmosphere ? `with a ${params.atmosphere} atmosphere` : "";
      directorNote += `${light} ${mood}. `;
    }
    if (params.cameraBody || params.focalLength || params.lensType) {
      const body = params.cameraBody || "Professional Cinema Camera";
      const lens = params.focalLength || "Prime Lens";
      const type = params.lensType ? `, ${params.lensType} optics` : "";
      directorNote += `Captured on ${body} using a ${lens}${type}. `;
    }
    if (params.genre || params.photographerStyle || params.movieLook || params.filter) {
      const parts = [params.genre, params.photographerStyle, params.movieLook, params.filter].filter(Boolean);
      directorNote += `Style: ${parts.join(", ")}. `;
    }
    return directorNote.trim();
  };

  const compilePrompt = () => {
    const note = getDirectorNote();
    return `${note} ${prompt.trim()}`.trim();
  };

  const handlePromptModeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);
    setParams({});
  };

  const copyToClipboard = () => {
    const fullText = isPromptMode ? prompt : compilePrompt();
    navigator.clipboard.writeText(fullText);
  };

  const handleOptionSelect = (key: keyof CinematicParams, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
    setSelectionView(null);
  };

  const handleReset = () => {
    setParams({});
    setAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveModal(null);
    setSelectionView(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      const remainingSlots = 15 - attachments.length;
      const filesToProcess = files.slice(0, remainingSlots);
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => setAttachments(prev => [...prev, event.target?.result as string].slice(0, 15));
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderSelectionGrid = () => {
    if (!selectionView) return null;
    return (
      <div className="absolute bottom-[calc(100%+24px)] left-0 w-[500px] max-h-[50vh] bg-[#1a1a1a]/70 backdrop-blur-[160px] text-white rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 z-[60]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div><h3 className="text-[14px] font-black uppercase tracking-tight text-white">{selectionView.title}</h3><p className="text-[9px] font-bold text-white/30 mt-0.5 tracking-wider uppercase">// {selectionView.options.length} OPTIONS</p></div>
          <button onClick={() => setSelectionView(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-6">
          <div className="relative mb-4"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={14} /><input type="text" placeholder="Filter..." className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 ring-[#c7ff00]/20 transition-all text-[13px] font-medium text-white placeholder:text-white/20" /></div>
          <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[30vh] pr-1 scrollbar-thin">
            {selectionView.options.map(opt => (
              <button key={opt.id} onClick={() => handleOptionSelect(selectionView.key, opt.label)} className="group relative aspect-[4/5] rounded-xl overflow-hidden text-left transition-transform active:scale-95 border border-white/5">
                <img src={opt.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent p-3 flex flex-col justify-end"><span className="text-[10px] font-black text-white leading-tight uppercase tracking-wide">{opt.label}</span></div>
                {params[selectionView.key] === opt.label && (<div className="absolute top-2 right-2 w-5 h-5 bg-[#c7ff00] rounded-full flex items-center justify-center shadow-lg"><Check size={12} className="text-black stroke-[4px]" /></div>)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderModalContent = () => {
    if (selectionView) return renderSelectionGrid();
    if (!activeModal) return null;
    return (
      <div ref={modalRef} className="absolute bottom-[calc(100%+24px)] left-0 w-[340px] bg-[#1a1a1a]/70 backdrop-blur-[160px] text-white rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="p-2 bg-white/5 rounded-lg text-[#c7ff00]">{tools.find(t => t.id === activeModal)?.icon}</div><h3 className="text-[13px] font-black uppercase tracking-tight text-white">{activeModal}</h3></div>
          <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-6">
          {activeModal === 'subject' && (
            <div className="space-y-4">
              <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Shot Type</label><button onClick={() => setSelectionView({ title: 'Shot Framing', options: SHOT_TYPE_OPTIONS, key: 'shotType' })} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group"><span className={`text-[11px] font-bold ${params.shotType ? 'text-white' : 'text-white/20'}`}>{params.shotType || 'Select...'}</span><ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" /></button></div>
              <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">View Angle</label><button onClick={() => setSelectionView({ title: 'Camera Angle', options: ANGLE_OPTIONS, key: 'viewDirection' })} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group"><span className={`text-[11px] font-bold ${params.viewDirection ? 'text-white' : 'text-white/20'}`}>{params.viewDirection || 'Select...'}</span><ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" /></button></div>
            </div>
          )}
          {activeModal === 'lighting' && (
            <div className="space-y-4">
              <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Source</label><button onClick={() => setSelectionView({ title: 'Select Source', options: LIGHTING_OPTIONS, key: 'lightingSource' })} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group"><span className={`text-[11px] font-bold ${params.lightingSource ? 'text-white' : 'text-white/20'}`}>{params.lightingSource || 'Select...'}</span><ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" /></button></div>
              <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Mood</label><button onClick={() => setSelectionView({ title: 'Select Mood', options: LIGHTING_OPTIONS, key: 'atmosphere' })} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group"><span className={`text-[11px] font-bold ${params.atmosphere ? 'text-white' : 'text-white/20'}`}>{params.atmosphere || 'Select...'}</span><ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" /></button></div>
            </div>
          )}
          {activeModal === 'camera' && (
            <div className="space-y-4">
              <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Gear</label><button onClick={() => setSelectionView({ title: 'Select Body', options: CAMERA_OPTIONS, key: 'cameraBody' })} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group"><span className={`text-[11px] font-bold ${params.cameraBody ? 'text-white' : 'text-white/20'}`}>{params.cameraBody || 'Select...'}</span><ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" /></button></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Lens</label><button onClick={() => setSelectionView({ title: 'Select Lens', options: LENS_OPTIONS, key: 'focalLength' })} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group"><span className={`text-[10px] font-bold ${params.focalLength ? 'text-white' : 'text-white/20'}`}>{params.focalLength || 'Select...'}</span><ChevronRight size={12} className="text-white/20 group-hover:text-white transition-colors" /></button></div>
                <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Type</label><button onClick={() => setSelectionView({ title: 'Lens Type', options: LENS_TYPE_OPTIONS, key: 'lensType' })} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group"><span className={`text-[10px] font-bold ${params.lensType ? 'text-white' : 'text-white/20'}`}>{params.lensType || 'Select...'}</span><ChevronRight size={12} className="text-white/20 group-hover:text-white transition-colors" /></button></div>
              </div>
              <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Film Stock</label><button onClick={() => setSelectionView({ title: 'Select Film Stock', options: FILM_STOCK_OPTIONS, key: 'filmStock' })} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group"><span className={`text-[11px] font-bold ${params.filmStock ? 'text-white' : 'text-white/20'}`}>{params.filmStock || 'Select...'}</span><ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" /></button></div>
            </div>
          )}
          {activeModal === 'style' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Genre</label><button onClick={() => setSelectionView({ title: 'Select Genre', options: GENRE_OPTIONS, key: 'genre' })} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group text-left"><span className={`text-[10px] font-bold truncate pr-1 ${params.genre ? 'text-white' : 'text-white/20'}`}>{params.genre || 'Select...'}</span><ChevronRight size={12} className="text-white/20 group-hover:text-white shrink-0" /></button></div>
                <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Photographer</label><button onClick={() => setSelectionView({ title: 'Photographer Style', options: PHOTOGRAPHER_STYLE_OPTIONS, key: 'photographerStyle' })} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group text-left"><span className={`text-[10px] font-bold truncate pr-1 ${params.photographerStyle ? 'text-white' : 'text-white/20'}`}>{params.photographerStyle || 'Select...'}</span><ChevronRight size={12} className="text-white/20 group-hover:text-white shrink-0" /></button></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Movie Look</label><button onClick={() => setSelectionView({ title: 'Movie Aesthetic', options: MOVIE_LOOK_OPTIONS, key: 'movieLook' })} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group text-left"><span className={`text-[10px] font-bold truncate pr-1 ${params.movieLook ? 'text-white' : 'text-white/20'}`}>{params.movieLook || 'Select...'}</span><ChevronRight size={12} className="text-white/20 group-hover:text-white shrink-0" /></button></div>
                <div className="space-y-1.5"><label className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Filter</label><button onClick={() => setSelectionView({ title: 'Filter / Effect', options: FILTER_OPTIONS, key: 'filter' })} className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:border-[#c7ff00]/40 transition-all group text-left"><span className={`text-[10px] font-bold truncate pr-1 ${params.filter ? 'text-white' : 'text-white/20'}`}>{params.filter || 'Select...'}</span><ChevronRight size={12} className="text-white/20 group-hover:text-white shrink-0" /></button></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasActiveParams = Object.values(params).some(v => !!v);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[90vw] lg:max-w-4xl px-4 z-50">
      <div className="relative">
        {renderModalContent()}

        {/* Consistent Angles Button - Only visible when Variations = 1 */}
        {numVariations === 1 && !isGenerating && prompt.trim() && (
          <button
            onClick={() => onGenerate(isPromptMode ? {} : params, attachments, 'consistent-angles')}
            className="absolute bottom-[calc(100%+24px)] right-4 px-6 h-11 bg-black/80 backdrop-blur-2xl border border-[#c7ff00]/30 rounded-2xl flex items-center gap-3 text-[#c7ff00] text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:bg-[#c7ff00] hover:text-black transition-all animate-in fade-in slide-in-from-bottom-2 duration-500 active:scale-95 group"
          >
            <Compass size={18} className="group-hover:rotate-45 transition-transform duration-500" />
            <span>Generate 4 Angles</span>
          </button>
        )}

        <div className={`bg-[#121212]/95 backdrop-blur-3xl border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.9)] rounded-[2.5rem] p-5 flex flex-col gap-4 transition-all duration-500 ${hasActiveParams || attachments.length > 0 ? 'pb-4' : ''}`}>
          <div className="w-full flex gap-4">
            <div className="flex flex-col"><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple /><button onClick={() => fileInputRef.current?.click()} disabled={attachments.length >= 15} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 border border-white/5"><Plus size={20} /></button></div>
            <div className="flex-1 flex flex-col relative min-h-[44px]">
              {attachments.length > 0 && (<div className="flex flex-wrap gap-2 mb-3 animate-in fade-in slide-in-from-left-4 duration-300">{attachments.map((att, idx) => (<div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 group shadow-lg"><img src={att} className="w-full h-full object-cover" /><button onClick={() => removeAttachment(idx)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={14} className="text-white" /></button></div>))}</div>)}
              {isPromptMode ? (
                <div className="relative group w-full">
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 animate-in fade-in duration-300">
                    <span className="text-[#c7ff00] font-black text-[10px] uppercase tracking-[0.2em] mb-2 block">Compiled Script //</span>
                    <textarea
                      ref={promptModeRef}
                      value={prompt}
                      onChange={handlePromptModeChange}
                      placeholder="Fine-tune your polished prompt..."
                      className="w-full bg-transparent resize-none outline-none text-[14px] text-white/80 font-medium leading-relaxed max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
                      rows={1}
                    />
                  </div>
                  <button onClick={copyToClipboard} className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-[#c7ff00] hover:text-black rounded-lg transition-all active:scale-95 shadow-xl border border-white/5 group"><Copy size={14} /></button>
                </div>
              ) : (
                <textarea ref={textareaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your cinematic vision..." className="w-full bg-transparent resize-none outline-none text-[15px] leading-relaxed text-white placeholder-gray-600 font-medium py-1 px-1 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10" rows={1} />
              )}
              {hasActiveParams && !isPromptMode && (<div className="flex flex-wrap gap-2 mt-3 border-t border-white/5 pt-3 animate-in fade-in duration-300">{Object.entries(params).map(([key, value]) => value ? (<div key={key} className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 shadow-sm"><span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{key === 'viewDirection' ? 'Angle' : key}:</span><span className="text-[10px] font-bold text-[#c7ff00]">{value}</span><button onClick={() => setParams({ ...params, [key]: undefined })} className="text-white/20 hover:text-white transition-colors ml-1"><X size={10} /></button></div>) : null)}</div>)}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4 overflow-hidden">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsAspectRatioMenuOpen(!isAspectRatioMenuOpen)} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 border border-white/5 ${isAspectRatioMenuOpen ? 'bg-white text-black shadow-xl scale-110' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}><Monitor size={18} /></button>
                {isAspectRatioMenuOpen && (
                  <div className="absolute bottom-[calc(100%+12px)] left-0 w-44 bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/10 rounded-[1.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.7)] overflow-hidden p-2 animate-in fade-in slide-in-from-bottom-3 duration-300 z-[100]">
                    <div className="text-[9px] font-black text-white/30 px-3.5 py-2 uppercase tracking-[0.2em] mb-1">Ratio</div>
                    {Object.values(AspectRatio).map((ratio) => (<button key={ratio} onClick={() => { setAspectRatio(ratio); setIsAspectRatioMenuOpen(false); }} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[12px] font-bold transition-all ${aspectRatio === ratio ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><span>{ratio}</span>{aspectRatio === ratio && <Check size={14} className="text-[#c7ff00]" />}</button>))}
                  </div>
                )}
              </div>
              <div className="h-6 w-px bg-white/10"></div>
              <div className="relative" ref={resMenuRef}>
                <button onClick={() => setIsResolutionMenuOpen(!isResolutionMenuOpen)} className={`h-9 px-4 flex items-center gap-2 rounded-xl transition-all duration-300 border border-white/5 ${isResolutionMenuOpen ? 'bg-white text-black shadow-xl scale-110' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}><Box size={16} /><span className="text-[10px] font-black uppercase tracking-widest">{resolution}</span></button>
                {isResolutionMenuOpen && (
                  <div className="absolute bottom-[calc(100%+12px)] left-0 w-44 bg-[#1a1a1a]/70 backdrop-blur-xl border border-white/10 rounded-[1.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.7)] overflow-hidden p-2 animate-in fade-in slide-in-from-bottom-3 duration-300 z-[100]">
                    <div className="text-[9px] font-black text-white/30 px-3.5 py-2 uppercase tracking-[0.2em] mb-1">Definition</div>
                    {Object.values(Resolution).map((res) => (<button key={res} onClick={() => { setResolution(res); setIsResolutionMenuOpen(false); }} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[12px] font-bold transition-all ${resolution === res ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}><span>{res}</span>{resolution === res && <Check size={14} className="text-[#c7ff00]" />}</button>))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-end">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-2xl border border-white/5 shadow-inner"><Layers size={14} className="text-white/30" /><div className="flex items-center gap-0.5">{[1, 2, 3, 4].map((num) => (<button key={num} onClick={() => setNumVariations(num)} className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${numVariations === num ? 'bg-[#c7ff00] text-black shadow-[0_0_15px_rgba(199,255,0,0.4)]' : 'text-white/30 hover:text-white/60'}`}>{num}</button>))}</div></div>
              {(hasActiveParams || attachments.length > 0) && (<button onClick={handleReset} className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all group" title="Reset Presets"><RotateCcw size={16} className="group-hover:rotate-[-90deg] transition-transform duration-500" /><span className="text-[10px] font-black uppercase tracking-widest">Reset</span></button>)}
              <div className="flex items-center gap-1.5 bg-black/40 rounded-2xl p-1.5 border border-white/5 shadow-inner">
                {tools.map((tool) => {
                  const isActive = (tool.id === 'subject' && (params.shotType || params.viewDirection)) || (tool.id === 'lighting' && (params.lightingSource || params.atmosphere)) || (tool.id === 'camera' && (params.cameraBody || params.focalLength || params.lensType)) || (tool.id === 'style' && (params.genre || params.photographerStyle || params.movieLook || params.filter));
                  return (<button key={tool.id} data-tool-id={tool.id} onClick={() => { setActiveModal(activeModal === tool.id ? null : tool.id); }} className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 relative ${activeModal === tool.id ? 'bg-white text-black shadow-xl scale-110' : (isActive ? 'text-[#c7ff00] bg-white/10' : 'text-gray-500 hover:text-white hover:bg-white/10')}`}>{React.cloneElement(tool.icon as React.ReactElement, { size: 16 })}{isActive && activeModal !== tool.id && (<div className="absolute -top-1 -right-1 w-2 h-2 bg-[#c7ff00] rounded-full shadow-[0_0_12px_rgba(199,255,0,1)] border border-black/50" />)}</button>);
                })}
              </div>
              <button
                onClick={() => {
                  if (!isPromptMode) {
                    const fullBaked = compilePrompt();
                    setPrompt(fullBaked);
                    setParams({});
                  }
                  setIsPromptMode(!isPromptMode);
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-500 relative ${isPromptMode ? 'bg-[#c7ff00] text-black shadow-[0_0_20px_rgba(199,255,0,0.5)] scale-110' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
                title="Prompt Engineer Mode"
              >
                <Zap size={18} className={isPromptMode ? "fill-black" : ""} />
                {isPromptMode && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full border border-[#c7ff00] animate-pulse" />}
              </button>
              <button
                onClick={() => onGenerate(isPromptMode ? {} : params, attachments)}
                disabled={isGenerating || !prompt.trim()}
                className="custom-gradient-btn flex items-center justify-center gap-2 px-6 h-10 min-w-[130px] rounded-2xl font-semibold text-[12px] uppercase tracking-tight transition-all active:scale-[0.97] disabled:opacity-30 shadow-[0_15px_40px_rgba(199,255,0,0.3)] hover:shadow-[0_15px_50px_rgba(199,255,0,0.4)]"
              >
                {isGenerating ? (<div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />) : (<><span>Generate</span><img src={sparklesIcon} alt="" className="w-4 h-4" /></>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
