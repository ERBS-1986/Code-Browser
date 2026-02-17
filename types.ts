
export interface CodeElement {
  id: string;
  name: string;
  codeSnippet: string;
  explanation: string;
  type: 'button' | 'input' | 'card' | 'layout' | 'logic';
}

export interface GeneratedApp {
  title: string;
  fullCode: string;
  elements: CodeElement[];
}

export interface AppState {
  currentApp: GeneratedApp | null;
  loading: boolean;
  hoveredElement: CodeElement | null;
  url: string;
}
