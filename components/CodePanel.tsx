
import React from 'react';
import { CodeElement } from '../types';

interface CodePanelProps {
  fullCode: string;
  hoveredElement: CodeElement | null;
}

const CodePanel: React.FC<CodePanelProps> = ({ fullCode, hoveredElement }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 border-b border-slate-800 overflow-hidden font-mono text-sm">
      <div className="px-4 py-2 bg-slate-900 flex items-center justify-between border-b border-slate-800">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Source Code</span>
        {hoveredElement && (
          <span className="text-blue-400 text-xs animate-pulse">
            Focused: {hoveredElement.name}
          </span>
        )}
      </div>
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {hoveredElement ? (
          <div className="space-y-4">
             <div className="text-slate-500 mb-2">// Showing snippet for {hoveredElement.name}</div>
             <pre className="text-blue-300 whitespace-pre-wrap p-3 bg-slate-900/50 rounded-lg border border-blue-900/30">
               {hoveredElement.codeSnippet}
             </pre>
             <div className="text-slate-600 border-t border-slate-800 pt-4">
                <div className="text-xs uppercase mb-2 font-bold">Context:</div>
                <pre className="text-slate-400 opacity-50 select-none">
                  {fullCode.slice(0, 100)}...
                </pre>
             </div>
          </div>
        ) : (
          <pre className="text-green-400 whitespace-pre-wrap">
            {fullCode || "// Type an app name in the address bar to begin..."}
          </pre>
        )}
      </div>
    </div>
  );
};

export default CodePanel;
