import React from 'react';
import { FileNode } from '../types';
import { RefreshCw, Shield, ChevronLeft, ChevronRight, Home, MoreVertical, Globe, Folder, File, ChevronDown } from 'lucide-react';

interface BrowserWindowProps {
  rootFolder: FileNode | null;
  loading: boolean;
  onFileSelect: (file: FileNode) => void;
  selectedFile: FileNode | null;
}

const FileItem: React.FC<{
  node: FileNode;
  level: number;
  onSelect: (file: FileNode) => void;
  selectedFile: FileNode | null;
}> = ({ node, level, onSelect, selectedFile }) => {
  const [isOpen, setIsOpen] = React.useState(level === 0);
  const isSelected = selectedFile?.path === node.path;

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsOpen(!isOpen);
    } else {
      onSelect(node);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
          }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {node.type === 'directory' ? (
          <>
            <ChevronDown size={14} className={`transition-transform ${isOpen ? '' : '-rotate-90 text-gray-400'}`} />
            <Folder size={16} className={isOpen ? 'text-yellow-500' : 'text-gray-400'} />
          </>
        ) : (
          <>
            <div className="w-3.5" />
            <File size={16} className={isSelected ? 'text-blue-500' : 'text-gray-400'} />
          </>
        )}
        <span className={`text-sm truncate ${isSelected ? 'font-bold' : 'font-medium text-gray-700'}`}>
          {node.name}
        </span>
      </div>

      {node.type === 'directory' && isOpen && node.children && (
        <div className="animate-in slide-in-from-top-1 duration-200">
          {node.children.map(child => (
            <FileItem
              key={child.path}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BrowserWindow: React.FC<BrowserWindowProps> = ({ rootFolder, loading, onFileSelect, selectedFile }) => {
  return (
    <div className="flex-1 flex flex-col bg-white text-gray-900 overflow-hidden m-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200/50">
      {/* Browser Toolbar */}
      <div className="h-14 bg-gray-50/80 backdrop-blur-md flex items-center px-6 gap-6 border-b border-gray-200">
        <div className="flex gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-red-400/80 shadow-sm"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-yellow-400/80 shadow-sm"></div>
          <div className="w-3.5 h-3.5 rounded-full bg-green-400/80 shadow-sm"></div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <ChevronLeft size={20} className="hover:text-gray-600 transition-colors" />
          <ChevronRight size={20} className="hover:text-gray-600 transition-colors" />
          <RefreshCw size={18} className={`${loading ? "animate-spin text-blue-500" : "hover:text-gray-600 transition-colors"}`} />
        </div>
        <div className="flex-1 h-9 bg-white rounded-lg border border-gray-200 flex items-center px-4 gap-3 text-xs shadow-sm shadow-black/5">
          <Shield size={14} className="text-green-500 shrink-0" />
          <span className="text-gray-400 select-none">file:///</span>
          <span className="text-gray-800 font-medium truncate">{rootFolder?.name || "explorador"}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <Home size={20} className="hover:text-gray-600 transition-colors" />
          <MoreVertical size={20} className="hover:text-gray-600 transition-colors" />
        </div>
      </div>

      {/* Viewport content */}
      <div className="flex-1 overflow-auto bg-white flex flex-col custom-scrollbar">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 tracking-tight">Carregando Projeto</p>
              <p className="text-sm text-gray-400 animate-pulse font-medium">Lendo estrutura de diretórios...</p>
            </div>
          </div>
        ) : rootFolder ? (
          <div className="p-4 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Folder size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{rootFolder.name}</h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Navegador Local</p>
              </div>
            </div>

            <div className="space-y-1">
              <FileItem
                node={rootFolder}
                level={0}
                onSelect={onFileSelect}
                selectedFile={selectedFile}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/10 rotate-3">
              <Folder size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-black mb-3 text-gray-900 tracking-tight">Navegador de Código</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Clique no botão "Project Folder" no topo para selecionar uma pasta local e começar a navegar pelos arquivos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserWindow;
