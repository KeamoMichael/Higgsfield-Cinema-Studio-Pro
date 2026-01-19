
import React from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import { X, Key, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [apiKey, setApiKey] = React.useState('');
  const { saveKey } = useApiKey();

  const handleConnect = async () => {
    if (apiKey.trim()) {
      saveKey(apiKey.trim());
      onClose();
      return;
    }

    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Proceed immediately as per race condition guidelines
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        {/* Header Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#c7ff00]/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="p-10 pt-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#c7ff00]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#c7ff00]/20">
            <Key className="text-[#c7ff00]" size={32} />
          </div>

          <h2 className="text-2xl font-black text-white mb-3 tracking-tight uppercase">
            Connect API Key
          </h2>

          <p className="text-[14px] text-gray-400 leading-relaxed mb-8 px-4 font-medium">
            To unlock the full potential of <span className="text-white">Gemini 3 Pro</span> and generate high-fidelity 4K cinematic frames, connect your professional API key.
          </p>

          <div className="w-full space-y-4">
            <input
              type="password"
              placeholder="Paste your API Key here"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#c7ff00]/50 transition-colors text-center font-mono text-sm"
            />
            <button
              onClick={handleConnect}
              className="w-full custom-gradient-btn h-14 rounded-2xl font-black text-[13px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_15px_30px_rgba(199,255,0,0.25)]"
            >
              <span>Connect Professional Key</span>
              <Sparkles size={18} className="fill-black" />
            </button>

            <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-white/30 uppercase tracking-widest">
                <ShieldCheck size={14} />
                Secure Environment
              </div>

              <a
                href="https://ai.google.dev/gemini-api/docs/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] font-bold text-[#c7ff00] hover:text-[#d4ff33] transition-colors"
              >
                Billing Documentation
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-white/5 p-4 text-center">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
            Requires a paid GCP project key from AI Studio
          </p>
        </div>
      </div>
    </div>
  );
};
