import React from 'react';
import { FileNode } from '../types';
import { Terminal, FileCode } from 'lucide-react';

interface CodePanelProps {
  file: FileNode | null;
}

const CodePanel: React.FC<CodePanelProps> = ({ file }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden font-mono text-sm">
      <div className="px-4 py-3 bg-slate-900 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-blue-400" />
          <span className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Visualizador de Código</span>
        </div>
        {file && (
          <div className="flex items-center gap-2">
            <FileCode size={14} className="text-blue-500" />
            <span className="text-blue-400 text-[10px] font-bold uppercase tracking-tight">
              {file.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-slate-950 to-slate-900/50">
        {file ? (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <pre className="text-blue-100 whitespace-pre-wrap leading-relaxed">
              {file.content || "// Carregando conteúdo..."}
            </pre>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600">
            <Terminal size={40} className="mb-4 opacity-20" />
            <p className="text-xs uppercase tracking-[0.3em] opacity-40">Selecione um arquivo para visualizar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePanel;
