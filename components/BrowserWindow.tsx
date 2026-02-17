
import React from 'react';
import { CodeElement, GeneratedApp } from '../types';
import { RefreshCw, Shield, ChevronLeft, ChevronRight, Home, MoreVertical } from 'lucide-react';

interface BrowserWindowProps {
  app: GeneratedApp | null;
  loading: boolean;
  onHover: (element: CodeElement | null) => void;
  url: string;
}

const BrowserWindow: React.FC<BrowserWindowProps> = ({ app, loading, onHover, url }) => {
  return (
    <div className="flex-1 flex flex-col bg-white text-gray-900 overflow-hidden m-4 rounded-xl shadow-2xl border border-slate-700">
      {/* Browser Toolbar */}
      <div className="h-12 bg-gray-100 flex items-center px-4 gap-4 border-b border-gray-300">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400 shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-inner"></div>
          <div className="w-3 h-3 rounded-full bg-green-400 shadow-inner"></div>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <ChevronLeft size={18} />
          <ChevronRight size={18} />
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </div>
        <div className="flex-1 h-8 bg-white rounded-md border border-gray-300 flex items-center px-3 gap-2 text-xs">
          <Shield size={12} className="text-green-600" />
          <span className="text-gray-400">https://</span>
          <span className="text-gray-700 truncate">{url || "simulator.ai"}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <Home size={18} />
          <MoreVertical size={18} />
        </div>
      </div>

      {/* Viewport content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 animate-pulse font-medium">Generating application code...</p>
          </div>
        ) : app ? (
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <h1 className="text-3xl font-bold border-b pb-4 mb-6">{app.title}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {app.elements.map((el) => (
                <div
                  key={el.id}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 cursor-default bg-white shadow-sm
                    hover:border-blue-500 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                    ${el.type === 'logic' ? 'col-span-full border-dashed border-slate-200 opacity-80' : 'border-transparent'}
                  `}
                  onMouseEnter={() => onHover(el)}
                  onMouseLeave={() => onHover(null)}
                >
                  <div className="flex flex-col h-full">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">{el.type}</span>
                    <h3 className="text-lg font-semibold mb-2">{el.name}</h3>
                    
                    {el.type === 'button' && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 mt-auto">
                        Interact with {el.name}
                      </button>
                    )}
                    
                    {el.type === 'input' && (
                      <input 
                        type="text" 
                        placeholder={`Enter ${el.name.toLowerCase()}...`}
                        className="border border-slate-300 rounded-lg px-3 py-2 mt-auto focus:ring-2 focus:ring-blue-500 outline-none" 
                      />
                    )}
                    
                    {el.type === 'card' && (
                      <div className="text-slate-600 text-sm mt-auto">
                        This is a container representing {el.name.toLowerCase()}. It holds structured information and nested components.
                      </div>
                    )}
                    
                    {el.type === 'logic' && (
                      <div className="flex items-center gap-2 text-purple-600 font-mono text-xs">
                        <Shield size={14} />
                        <span>Background Process Logic</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-6 bg-slate-100 rounded-lg border border-slate-200 text-slate-500 text-center italic text-sm">
              The application logic is currently being simulated by Gemini based on the code shown in the left panel.
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
              <Home size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Browser Simulator</h2>
            <p className="text-gray-500 mb-8">
              Type the name of an application in the address bar (e.g., "Budget Tracker", "Task Dashboard", "Landing Page") to see it come to life.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserWindow;
