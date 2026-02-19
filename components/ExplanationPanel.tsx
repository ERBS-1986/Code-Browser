import React from 'react';
import { FileNode } from '../types';
import { Info, BookOpen, HardDrive } from 'lucide-react';

interface ExplanationPanelProps {
  file: FileNode | null;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ file }) => {
  return (
    <div className="h-full bg-slate-900 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-300">
          <BookOpen size={18} className="text-blue-400" />
          <h3 className="font-bold text-[10px] uppercase tracking-[0.2em]">Informações do Arquivo</h3>
        </div>
      </div>

      {file ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-[9px] uppercase font-black tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {file.type}
            </span>
            <h4 className="text-white font-bold text-sm tracking-tight">{file.name}</h4>
          </div>
          <div className="relative group">
            <div className="absolute -left-3 top-0 bottom-0 w-1 bg-blue-500/20 rounded-full group-hover:bg-blue-500/50 transition-colors" />
            <div className="pl-2 space-y-2">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Caminho Relativo</p>
              <p className="text-slate-300 text-sm font-mono break-all bg-slate-950/50 p-2 rounded border border-white/5">
                {file.path}
              </p>
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center opacity-40">
          <div className="p-4 bg-slate-800/50 rounded-full mb-4">
            <HardDrive size={24} className="text-slate-400" />
          </div>
          <p className="text-xs font-medium max-w-[200px] leading-relaxed">
            Selecione um arquivo no navegador à direita para ver seus detalhes.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;
