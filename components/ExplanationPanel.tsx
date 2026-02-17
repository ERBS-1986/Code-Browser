
import React from 'react';
import { CodeElement } from '../types';
import { Info, BookOpen } from 'lucide-react';

interface ExplanationPanelProps {
  element: CodeElement | null;
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ element }) => {
  return (
    <div className="h-1/3 bg-slate-900 border-t border-slate-800 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-3 text-slate-300">
        <BookOpen size={18} className="text-blue-400" />
        <h3 className="font-bold text-sm uppercase tracking-widest">Code Breakdown</h3>
      </div>
      
      {element ? (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
              element.type === 'button' ? 'bg-orange-900 text-orange-200' :
              element.type === 'logic' ? 'bg-purple-900 text-purple-200' :
              element.type === 'input' ? 'bg-cyan-900 text-cyan-200' :
              'bg-blue-900 text-blue-200'
            }`}>
              {element.type}
            </span>
            <h4 className="text-white font-medium">{element.name}</h4>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed italic">
            {element.explanation}
          </p>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
          <Info size={32} className="mb-2 opacity-20" />
          <p className="text-sm">Hover over an element in the browser screen<br/>to see how it works.</p>
        </div>
      )}
    </div>
  );
};

export default ExplanationPanel;
