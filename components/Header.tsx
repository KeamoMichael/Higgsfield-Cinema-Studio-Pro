
import logo from '../Assets/Higgsfield logo.jpg';

interface HeaderProps {
  onOpenKeyModal: () => void;
}

import { useApiKey } from '../contexts/ApiKeyContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const Header: React.FC<HeaderProps> = ({ onOpenKeyModal }) => {
  const { hasKey } = useApiKey();

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#0a0a0a]/80 backdrop-blur-3xl border-b border-white/5 z-50 flex items-center justify-between px-10">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
            <img src={logo} alt="Higgsfield" className="w-full h-full object-cover" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-white flex items-center gap-2.5">
            Cinema Studio
            <span className="text-[10px] bg-[#c7ff00] text-black px-1.5 py-0.5 rounded-[4px] font-black uppercase tracking-tighter">
              Pro
            </span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={onOpenKeyModal}
          className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[11px] font-bold tracking-wider transition-all uppercase border ${hasKey
              ? 'bg-[#c7ff00]/10 border-[#c7ff00]/20 text-[#c7ff00] hover:bg-[#c7ff00]/20'
              : 'custom-gradient-btn text-black border-transparent shadow-[0_0_20px_rgba(199,255,0,0.3)] hover:shadow-[0_0_30px_rgba(199,255,0,0.5)]'
            }`}
        >
          {hasKey ? (
            <>
              <CheckCircle2 size={14} />
              <span>System Connected</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#c7ff00] shadow-[0_0_10px_#c7ff00] animate-pulse ml-1" />
            </>
          ) : (
            <>
              <span>Connect API Key</span>
              <AlertCircle size={14} className="opacity-60" />
            </>
          )}
        </button>
      </div>
    </header>
  );
};
