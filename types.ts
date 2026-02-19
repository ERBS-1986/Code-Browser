
export interface FileNode {
  name: string;
  content: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export interface AppState {
  rootFolder: FileNode | null;
  selectedFile: FileNode | null;
  loading: boolean;
  url: string;
  isSimulating?: boolean;
  simulationUrl?: string | null;
}
