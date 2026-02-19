import React, { useEffect, useState } from 'react';
import { RefreshCw, Shield, ChevronLeft, ChevronRight, Home, MoreVertical, ExternalLink } from 'lucide-react';

interface SimulationWindowProps {
    url: string | null;
    onClose: () => void;
}

const SimulationWindow: React.FC<SimulationWindowProps> = ({ url, onClose }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        return () => {
            if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        };
    }, [url]);

    if (!url) return null;

    return (
        <div className="flex-1 flex flex-col bg-white text-gray-900 overflow-hidden m-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200/50 animate-in zoom-in-95 duration-300">
            {/* Simulation Toolbar */}
            <div className="h-14 bg-gray-50/80 backdrop-blur-md flex items-center px-6 gap-6 border-b border-gray-200">
                <div className="flex gap-2">
                    <div onClick={onClose} className="w-3.5 h-3.5 rounded-full bg-red-400/80 shadow-sm cursor-pointer hover:bg-red-500 transition-colors"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-400/80 shadow-sm"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-green-400/80 shadow-sm"></div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <ChevronLeft size={20} className="cursor-not-allowed" />
                    <ChevronRight size={20} className="cursor-not-allowed" />
                    <RefreshCw size={18} className={`${loading ? "animate-spin text-blue-500" : "hover:text-gray-600 transition-colors"}`} />
                </div>
                <div className="flex-1 h-9 bg-white rounded-lg border border-gray-200 flex items-center px-4 gap-3 text-xs shadow-sm shadow-black/5">
                    <Shield size={14} className="text-green-500 shrink-0" />
                    <span className="text-gray-400 select-none">https://</span>
                    <span className="text-gray-800 font-medium truncate">simulator.ai/preview</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <Home size={20} onClick={onClose} className="hover:text-gray-600 transition-colors cursor-pointer" />
                    <ExternalLink size={18} className="hover:text-gray-600 transition-colors cursor-pointer" onClick={() => window.open(url, '_blank')} />
                </div>
            </div>

            {/* Iframe Viewport */}
            <div className="flex-1 relative bg-white">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Iniciando Simulação...</p>
                        </div>
                    </div>
                )}
                <iframe
                    src={url}
                    className="w-full h-full border-none"
                    onLoad={() => setLoading(false)}
                    title="Project Simulation"
                    sandbox="allow-scripts allow-forms allow-same-origin"
                />
            </div>
        </div>
    );
};

export default SimulationWindow;
