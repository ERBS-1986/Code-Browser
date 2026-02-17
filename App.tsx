
import React, { useState, useCallback, useRef } from 'react';
import { AppState, CodeElement } from './types';
import { generateAppSimulation } from './services/geminiService';
import CodePanel from './components/CodePanel';
import ExplanationPanel from './components/ExplanationPanel';
import BrowserWindow from './components/BrowserWindow';
import { Search, Monitor, Code2, Globe, FolderOpen } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentApp: null,
    loading: false,
    hoveredElement: null,
    url: ''
  });

  const [inputUrl, setInputUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNavigate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl.trim()) return;

    setState(prev => ({ ...prev, loading: true, url: inputUrl }));
    
    try {
      const app = await generateAppSimulation(inputUrl);
      setState(prev => ({ ...prev, currentApp: app, loading: false }));
    } catch (error) {
      console.error("Error generating app:", error);
      setState(prev => ({ ...prev, loading: false }));
      alert("Failed to generate application. Please try a different prompt.");
    }
  };

  const processFileList = async (files: FileList | File[], folderName: string) => {
    const filesContent: string[] = [];
    const allowedExts = ['html', 'css', 'js', 'ts', 'jsx', 'tsx', 'json'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = (file as any).webkitRelativePath || file.name;
      
      // Skip node_modules and hidden files
      if (relativePath.includes('node_modules') || relativePath.includes('/.')) continue;

      const ext = file.name.split('.').pop()?.toLowerCase();
      if (allowedExts.includes(ext || '')) {
        try {
          const text = await file.text();
          filesContent.push(`--- FILE: ${relativePath} ---\n${text.slice(0, 5000)}`);
        } catch (err) {
          console.warn(`Could not read file ${relativePath}:`, err);
        }
      }
    }

    if (filesContent.length === 0) {
      throw new Error("No compatible web files found in the folder.");
    }

    const combinedContext = filesContent.join('\n\n');
    const app = await generateAppSimulation(`Folder: ${folderName}`, combinedContext);
    setState(prev => ({ ...prev, currentApp: app, loading: false }));
    setInputUrl(folderName);
  };

  const handleOpenFolder = async () => {
    // Try Modern File System Access API first
    try {
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        setState(prev => ({ ...prev, loading: true, url: `local:///${directoryHandle.name}` }));
        
        const files: File[] = [];
        async function readDir(handle: any, path = "") {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              Object.defineProperty(file, 'webkitRelativePath', {
                value: path ? `${path}/${file.name}` : file.name
              });
              files.push(file);
            } else if (entry.kind === 'directory' && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
              await readDir(entry, path ? `${path}/${entry.name}` : entry.name);
            }
          }
        }
        await readDir(directoryHandle);
        await processFileList(files, directoryHandle.name);
        return;
      }
    } catch (error: any) {
      // If security error (Cross-origin frame), fall back to input element
      console.warn("showDirectoryPicker failed or restricted, falling back to input:", error.message);
    }

    // Fallback: Use hidden input element
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Get folder name from the first file's path
    const folderName = files[0].webkitRelativePath.split('/')[0] || "Selected Folder";
    
    setState(prev => ({ ...prev, loading: true, url: `local:///${folderName}` }));
    try {
      await processFileList(files, folderName);
    } catch (error: any) {
      console.error("Error reading folder:", error);
      setState(prev => ({ ...prev, loading: false }));
      alert(`Error reading folder: ${error.message}`);
    }
    // Reset input so it triggers again for same folder
    e.target.value = '';
  };

  const handleHover = useCallback((element: CodeElement | null) => {
    setState(prev => ({ ...prev, hoveredElement: element }));
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950">
      {/* Hidden input for fallback folder selection */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        // @ts-ignore
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleFileInputChange}
      />

      {/* Top Header/Nav */}
      <header className="h-16 border-b border-slate-800 flex items-center px-6 gap-6 justify-between bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Globe className="text-white" size={20} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-xl tracking-tighter text-white">CODE<span className="text-blue-500 italic">BROWSER</span></h1>
          </div>
        </div>

        <div className="flex-1 max-w-3xl flex gap-2 items-center">
          <form onSubmit={handleNavigate} className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input
              type="text"
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-2.5 pl-12 pr-24 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
              placeholder="App name or URL... (e.g. 'Simple CRM')"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
              disabled={state.loading}
            >
              {state.loading ? '...' : 'LAUNCH'}
            </button>
          </form>

          <button
            onClick={handleOpenFolder}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 group"
            title="Open Local Folder Project"
            disabled={state.loading}
          >
            <FolderOpen size={16} className="text-yellow-500 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline uppercase tracking-wider">Project Folder</span>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 text-slate-400 border-r border-slate-800 pr-6">
             <div className="flex flex-col items-end">
               <span className="text-[10px] font-bold uppercase text-slate-500">Engine Status</span>
               <span className="text-xs text-green-500 flex items-center gap-1.5 font-medium">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 Gemini 3 Ready
               </span>
             </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Monitor size={20} /></button>
            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Code2 size={20} /></button>
          </div>
        </div>
      </header>

      {/* Main Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel (Code & Explanation) */}
        <div className="w-[480px] border-r border-slate-800 flex flex-col bg-slate-900 shadow-2xl z-0">
          <CodePanel 
            fullCode={state.currentApp?.fullCode || ""} 
            hoveredElement={state.hoveredElement} 
          />
          <ExplanationPanel element={state.hoveredElement} />
        </div>

        {/* Right Panel (Browser Simulation) */}
        <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] z-10 pointer-events-none backdrop-blur-sm shadow-xl">
            Live Execution Simulation
          </div>
          <BrowserWindow 
            app={state.currentApp} 
            loading={state.loading} 
            onHover={handleHover} 
            url={state.url}
          />
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-slate-800 bg-slate-900 flex items-center px-4 justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Monitor size={12} /> Real-time Simulation</span>
          <span className="flex items-center gap-1"><Globe size={12} /> Sandbox: Isolated</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-500">v2.5.0-Project-Sync</span>
          <div className="flex items-center gap-1 text-green-500">
            AI Rendering Active <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
