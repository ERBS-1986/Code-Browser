
import React, { useState, useCallback, useRef } from 'react';
import { AppState, FileNode } from './types';
import CodePanel from './components/CodePanel';
import ExplanationPanel from './components/ExplanationPanel';
import { transform } from 'sucrase';
import {
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  Rocket,
  Search,
  Loader2,
  ExternalLink,
  Code,
  Globe,
  Monitor,
  Code2
} from 'lucide-react';
import BrowserWindow from './components/BrowserWindow';
import SimulationWindow from './components/SimulationWindow';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    rootFolder: null,
    selectedFile: null,
    loading: false,
    url: '',
    isSimulating: false,
    simulationUrl: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const buildFileTree = async (files: File[]): Promise<FileNode | null> => {
    if (files.length === 0) return null;

    const root: FileNode = {
      name: 'root',
      path: '',
      content: '',
      type: 'directory',
      children: []
    };

    const filePromises: Promise<void>[] = [];

    files.forEach(file => {
      const path = (file as any).webkitRelativePath || file.name;
      const parts = path.split('/');
      let current = root;

      parts.forEach((part: string, index: number) => {
        const isFile = index === parts.length - 1;
        let node = current.children?.find(child => child.name === part);

        if (!node) {
          node = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            content: '',
            type: isFile ? 'file' : 'directory',
            children: isFile ? undefined : []
          };
          current.children?.push(node);
        }

        if (isFile) {
          const targetNode = node;
          filePromises.push(
            file.text().then(text => {
              targetNode.content = text;
            })
          );
        } else {
          current = node;
        }
      });
    });

    await Promise.all(filePromises);
    return root;
  };

  const processFileList = async (files: FileList | File[], folderName: string) => {
    const fileArray = Array.from(files);
    setState(prev => ({ ...prev, loading: true }));

    const root = await buildFileTree(fileArray);
    if (root) {
      root.name = folderName;
      // Se tivermos apenas um filho e for uma pasta com o mesmo nome, descemos um nível (comum em webkitdirectory)
      if (root.children?.length === 1 && root.children[0].type === 'directory' &&
        (root.children[0].name === folderName || root.children[0].name === 'root')) {
        root.children[0].name = folderName;
        setState(prev => ({
          ...prev,
          rootFolder: root.children![0],
          loading: false,
          url: `local:///${folderName}`
        }));
        return;
      }
    }

    setState(prev => ({
      ...prev,
      rootFolder: root,
      loading: false,
      url: `local:///${folderName}`
    }));
  };

  const handleOpenFolder = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        setState(prev => ({ ...prev, loading: true }));

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
      console.warn("showDirectoryPicker failed or restricted:", error.message);
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const folderName = files[0].webkitRelativePath.split('/')[0] || "Selected Folder";
    await processFileList(files, folderName);
    e.target.value = '';
  };

  const handleFileSelect = useCallback((file: FileNode) => {
    setState(prev => ({ ...prev, selectedFile: file, isSimulating: false }));
  }, []);

  const findIndexHtml = (node: FileNode): FileNode | null => {
    if (node.type === 'file' && node.name.toLowerCase() === 'index.html') {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = findIndexHtml(child);
        if (found) return found;
      }
    }
    return null;
  };

  const handleLaunch = async () => {
    if (!state.rootFolder) return;

    setState(prev => ({ ...prev, loading: true }));

    const indexFile = findIndexHtml(state.rootFolder);

    if (!indexFile || !indexFile.content) {
      alert("⚠️ Atenção: Não encontramos um arquivo 'index.html' na raiz ou subpastas deste projeto. Certifique-se de carregar a pasta correta para simular a aplicação.");
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const blobUrls: Record<string, string> = {};
      const importMap: Record<string, string> = {};
      const rootPath = state.rootFolder.path;

      const createBlobs = (node: FileNode) => {
        if (node.type === 'file' && node.content) {
          let content = node.content;
          let mimeType = 'text/plain';
          const ext = node.name.split('.').pop()?.toLowerCase();

          if (ext === 'html') mimeType = 'text/html';
          else if (ext === 'css') mimeType = 'text/css';
          else if (ext === 'js') mimeType = 'application/javascript';
          else if (ext === 'json') mimeType = 'application/json';
          else if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) {
            mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
          }

          // Transpilação para TS/TSX
          if (ext === 'ts' || ext === 'tsx') {
            try {
              const result = transform(content, {
                transforms: ['typescript', 'jsx'],
                production: false,
              });
              content = result.code;
              mimeType = 'application/javascript';
            } catch (e) {
              console.error(`Erro ao transpilar ${node.name}:`, e);
            }
          }

          const blob = new Blob([content], { type: mimeType });
          const url = URL.createObjectURL(blob);

          const relativePath = node.path.startsWith(rootPath + '/')
            ? node.path.slice(rootPath.length + 1)
            : (node.path === rootPath ? node.name : node.path);

          blobUrls[relativePath] = url;

          // Registrar no Import Map
          importMap[relativePath] = url;
          importMap['./' + relativePath] = url;
          importMap['/' + relativePath] = url;

          // Versão sem extensão para módulos JS/TS/TSX
          if (['js', 'ts', 'tsx'].includes(ext || '')) {
            const baseName = relativePath.slice(0, relativePath.lastIndexOf('.'));
            importMap[baseName] = url;
            importMap['./' + baseName] = url;
            importMap['/' + baseName] = url;
          }
        }
        if (node.children) node.children.forEach(createBlobs);
      };

      createBlobs(state.rootFolder);

      try {
        let processedHtml = indexFile.content;

        // Injetar o Import Map no HTML (mesclando com o existente se houver)
        let existingImports = {};
        const importMapRegex = /<script type="importmap">([\s\S]*?)<\/script>/i;
        const match = processedHtml.match(importMapRegex);

        if (match) {
          try {
            const existingMap = JSON.parse(match[1]);
            existingImports = existingMap.imports || {};
            processedHtml = processedHtml.replace(importMapRegex, ''); // Remove antigo
          } catch (e) {
            console.warn("Falha ao analisar importmap existente", e);
          }
        }

        const mergedImports = { ...existingImports, ...importMap };
        const importMapScript = `
<script type="importmap">
{
  "imports": ${JSON.stringify(mergedImports, null, 2)}
}
</script>`;

        if (processedHtml.includes('<head>')) {
          processedHtml = processedHtml.replace('<head>', '<head>' + importMapScript);
        } else {
          processedHtml = importMapScript + processedHtml;
        }

        // Substituir index.tsx por sua versão Blob (JavaScript) no HTML
        Object.keys(blobUrls).forEach(path => {
          if (path.endsWith('.tsx') || path.endsWith('.ts')) {
            const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`src=["'](\\./|/)?${escapedPath}["']`, 'gi');
            processedHtml = processedHtml.replace(regex, `src="${blobUrls[path]}"`);
          }
        });

        const finalBlob = new Blob([processedHtml], { type: 'text/html' });
        const simulationUrl = URL.createObjectURL(finalBlob);

        setState(prev => ({
          ...prev,
          isSimulating: true,
          simulationUrl,
          loading: false
        }));
      } catch (error) {
        console.error("Erro ao processar HTML da simulação:", error);
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Erro ao iniciar simulação:", error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

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

        <div className="flex-1 flex justify-center gap-4 items-center">
          <button
            onClick={handleLaunch}
            disabled={!state.rootFolder || state.loading}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:opacity-50 text-white px-8 py-2.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-lg shadow-blue-500/20 group uppercase tracking-[0.2em]"
          >
            <Rocket size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            Launch App
          </button>

          <button
            onClick={handleOpenFolder}
            className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-6 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 group uppercase tracking-widest"
            title="Abrir Pasta de Projeto"
            disabled={state.loading}
          >
            <FolderOpen size={18} className="text-yellow-500 group-hover:scale-110 transition-transform" />
            Project Folder
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2 text-slate-400 border-r border-slate-800 pr-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase text-slate-500">Estado do Navegador</span>
              <span className="text-xs text-blue-500 flex items-center gap-1.5 font-medium">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                Ativo
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
        {/* Left Panel (Code & Explanation) - 40% width */}
        <div className="w-[40%] min-w-[320px] max-w-[600px] border-r border-slate-800 flex flex-col bg-slate-900 shadow-2xl z-0">
          <div className="flex-1 overflow-hidden flex flex-col">
            <CodePanel
              file={state.selectedFile}
            />
          </div>
          <div className="h-1/3 min-h-[200px] border-t border-slate-800">
            <ExplanationPanel file={state.selectedFile} />
          </div>
        </div>

        {/* Right Panel (File Explorer) - 60% width */}
        <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] z-10 pointer-events-none backdrop-blur-sm shadow-xl">
            {state.isSimulating ? "Live Execution Simulation" : "Explorador de Arquivos"}
          </div>
          {state.isSimulating ? (
            <SimulationWindow
              url={state.simulationUrl ?? null}
              onClose={() => setState(prev => ({ ...prev, isSimulating: false }))}
            />
          ) : (
            <BrowserWindow
              rootFolder={state.rootFolder}
              loading={state.loading}
              onFileSelect={handleFileSelect}
              selectedFile={state.selectedFile}
            />
          )}
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-slate-800 bg-slate-900 flex items-center px-4 justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Monitor size={12} /> Navegação Local</span>
          <span className="flex items-center gap-1"><Globe size={12} /> Sandbox: Safe Mode</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-500">v3.0.0-Direct-Browser</span>
          <div className="flex items-center gap-1 text-slate-600">
            AI Disabled <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
