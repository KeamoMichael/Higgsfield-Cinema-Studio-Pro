
import logo from '../Assets/Higgsfield logo.jpg';

interface HeaderProps {
  onOpenKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenKeyModal }) => {
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
          className="custom-gradient-btn px-8 py-3 rounded-xl text-[12px] font-black tracking-tight transition-all active:scale-95 shadow-[0_0_25px_rgba(199,255,0,0.25)] hover:shadow-[0_0_35px_rgba(199,255,0,0.35)] uppercase"
        >
          Connect API Key
        </button>
      </div>
    </header>
  );
};
