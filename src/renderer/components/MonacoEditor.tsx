import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { MonacoActions, FileHandler } from './EditorActions';
import { MonacoThemeManager, MonacoTheme } from './ThemeManager';
import { MonacoFileManager, FileTabInfo } from './FileManager';
import './MonacoEditor.css';

// Comprehensive language support for YOLO-Browser
export const SUPPORTED_LANGUAGES = [
  { id: 'typescript', label: 'TypeScript', extensions: ['.ts', '.tsx'] },
  { id: 'javascript', label: 'JavaScript', extensions: ['.js', '.jsx', '.mjs'] },
  { id: 'html', label: 'HTML', extensions: ['.html', '.htm'] },
  { id: 'css', label: 'CSS', extensions: ['.css'] },
  { id: 'scss', label: 'SCSS', extensions: ['.scss'] },
  { id: 'less', label: 'Less', extensions: ['.less'] },
  { id: 'json', label: 'JSON', extensions: ['.json'] },
  { id: 'xml', label: 'XML', extensions: ['.xml'] },
  { id: 'markdown', label: 'Markdown', extensions: ['.md', '.markdown'] },
  { id: 'yaml', label: 'YAML', extensions: ['.yml', '.yaml'] },
  { id: 'python', label: 'Python', extensions: ['.py'] },
  { id: 'java', label: 'Java', extensions: ['.java'] },
  { id: 'csharp', label: 'C#', extensions: ['.cs'] },
  { id: 'cpp', label: 'C++', extensions: ['.cpp', '.cc', '.cxx'] },
  { id: 'c', label: 'C', extensions: ['.c', '.h'] },
  { id: 'php', label: 'PHP', extensions: ['.php'] },
  { id: 'ruby', label: 'Ruby', extensions: ['.rb'] },
  { id: 'go', label: 'Go', extensions: ['.go'] },
  { id: 'rust', label: 'Rust', extensions: ['.rs'] },
  { id: 'swift', label: 'Swift', extensions: ['.swift'] },
  { id: 'kotlin', label: 'Kotlin', extensions: ['.kt'] },
  { id: 'scala', label: 'Scala', extensions: ['.scala'] },
  { id: 'r', label: 'R', extensions: ['.r', '.R'] },
  { id: 'sql', label: 'SQL', extensions: ['.sql'] },
  { id: 'shell', label: 'Shell', extensions: ['.sh', '.bash'] },
  { id: 'powershell', label: 'PowerShell', extensions: ['.ps1'] },
  { id: 'dockerfile', label: 'Dockerfile', extensions: ['Dockerfile'] },
  { id: 'plaintext', label: 'Plain Text', extensions: ['.txt'] }
];

export interface MonacoEditorProps {
  value?: string;
  language?: string;
  theme?: 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light' | 'yolo-dark' | 'yolo-light';
  readOnly?: boolean;
  minimap?: boolean;
  wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  fontSize?: number;
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
  onChange?: (value: string | undefined) => void;
  onSave?: (value: string) => void;
  onTabChange?: (tab: FileTabInfo) => void;
  onTabsUpdate?: (tabs: FileTabInfo[]) => void;
  enableFileManagement?: boolean;
  enableThemeToggle?: boolean;
  className?: string;
}

interface EditorState {
  isLoaded: boolean;
  hasError: boolean;
  errorMessage?: string;
}

interface EditorManagers {
  actions?: MonacoActions;
  themeManager?: MonacoThemeManager;
  fileManager?: MonacoFileManager;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value = '',
  language = 'typescript',
  theme = 'yolo-dark',
  readOnly = false,
  minimap = true,
  wordWrap = 'on',
  fontSize = 14,
  lineNumbers = 'on',
  onChange,
  onSave,
  onTabChange,
  onTabsUpdate,
  enableFileManagement = false,
  enableThemeToggle = false,
  className = '',
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    isLoaded: false,
    hasError: false,
  });
  
  // Enhanced managers for advanced features
  const [managers, setManagers] = useState<EditorManagers>({});

  const initializeEditor = useCallback(() => {
    if (!containerRef.current) return;

    try {
      console.log('Initializing Monaco Editor directly...');
      
      // Configure Monaco theme
      monaco.editor.setTheme(theme);
      
      // Enhanced TypeScript and JavaScript configuration
      if (language === 'typescript' || language === 'javascript') {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          reactNamespace: 'React',
          allowJs: true,
          strict: false,
          skipLibCheck: true,
          noImplicitAny: false,
          strictNullChecks: false,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        });

        // Enhanced JavaScript configuration
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          allowJs: true,
          checkJs: false,
          noEmit: true,
          esModuleInterop: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        });

        // Add essential React types for better IntelliSense
        const reactTypes = `
          declare module 'react' {
            export interface Component<P = {}, S = {}> { }
            export function createElement(type: any, props?: any, ...children: any[]): any;
            export const useState: <T>(initial: T) => [T, (value: T) => void];
            export const useEffect: (fn: () => void, deps?: any[]) => void;
            export const useRef: <T>(initial: T) => { current: T };
            export const useCallback: <T extends (...args: any[]) => any>(fn: T, deps: any[]) => T;
            export const useMemo: <T>(fn: () => T, deps: any[]) => T;
            export const useContext: <T>(context: any) => T;
            export const useReducer: <T, A>(reducer: (state: T, action: A) => T, initial: T) => [T, (action: A) => void];
          }
        `;

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          reactTypes,
          'file:///node_modules/@types/react/index.d.ts'
        );
      }

      // CSS language configuration
      if (language === 'css' || language === 'scss' || language === 'less') {
        monaco.languages.css.cssDefaults.setOptions({
          validate: true,
          lint: {
            compatibleVendorPrefixes: 'warning',
            vendorPrefix: 'warning',
            duplicateProperties: 'warning',
            emptyRules: 'warning',
            importStatement: 'ignore',
            boxModel: 'ignore',
            universalSelector: 'ignore',
            zeroUnits: 'ignore',
            fontFaceProperties: 'warning',
            hexColorLength: 'error',
            argumentsInColorFunction: 'error',
            unknownProperties: 'warning',
            ieHack: 'ignore',
            unknownVendorSpecificProperties: 'ignore',
            propertyIgnoredDueToDisplay: 'warning',
            important: 'ignore',
            float: 'ignore',
            idSelector: 'ignore'
          }
        });
      }

      // HTML language configuration
      if (language === 'html') {
        monaco.languages.html.htmlDefaults.setOptions({
          format: {
            tabSize: 2,
            insertSpaces: true,
            wrapLineLength: 120,
            unformatted: 'default,a,abbr,acronym,b,bdo,big,br,button,cite,code,dfn,em,i,kbd,label,map,object,q,samp,small,span,strong,sub,sup,tt,var',
            contentUnformatted: 'pre,code,textarea',
            indentInnerHtml: false,
            preserveNewLines: true,
            maxPreserveNewLines: undefined,
            indentHandlebars: false,
            endWithNewline: false,
            extraLiners: 'head,body,/html',
            wrapAttributes: 'auto'
          },
          suggest: { html5: true, angular1: false, ionic: false }
        });
      }

      // JSON language configuration
      if (language === 'json') {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: true,
          allowComments: false,
          schemas: [],
          enableSchemaRequest: true
        });
      }

      // Editor options
      const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
        value,
        language,
        theme,
        readOnly,
        minimap: { enabled: minimap },
        wordWrap,
        fontSize,
        lineNumbers,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        contextmenu: true,
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        wordBasedSuggestions: 'currentDocument',
        parameterHints: { enabled: true },
        formatOnType: true,
        formatOnPaste: true,
        folding: true,
        showFoldingControls: 'always',
        foldingHighlight: true,
        links: true,
        colorDecorators: true,
      };

      // Create the editor
      const editor = monaco.editor.create(containerRef.current, editorOptions);
      editorRef.current = editor;

      // Initialize enhanced features
      if (enableFileManagement || enableThemeToggle) {
        // Initialize theme manager
        const themeManager = new MonacoThemeManager(editor);
        themeManager.setTheme(theme);

        // Initialize file management if enabled
        if (enableFileManagement && onSave) {
          // Create file handler
          const fileHandler: FileHandler = {
            openFile: (content, filename) => {
              console.log(`Opening file: ${filename}`);
            },
            saveFile: async (content, filename) => {
              onSave(content);
              console.log(`Saving file: ${filename}`);
              return true;
            },
            saveAsFile: async (content) => {
              onSave(content);
              console.log('Save as triggered');
              return 'untitled.txt';
            },
            newFile: () => {
              console.log('New file triggered');
            }
          };

          // Initialize enhanced actions
          new MonacoActions(editor, fileHandler);
          console.log('Enhanced Monaco features initialized');
        }
      }

      // Add Ctrl+S/Cmd+S save shortcut
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        if (onSave) {
          const currentValue = editor.getValue();
          onSave(currentValue);
        }
      });

      // Handle value changes
      editor.onDidChangeModelContent(() => {
        if (onChange) {
          const currentValue = editor.getValue();
          onChange(currentValue);
        }
      });

      setEditorState({
        isLoaded: true,
        hasError: false,
      });

    } catch (error) {
      console.error('Error initializing Monaco Editor:', error);
      setEditorState({
        isLoaded: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [theme, language, value, readOnly, minimap, wordWrap, fontSize, lineNumbers, onChange, onSave]);

  // Initialize editor when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      initializeEditor();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [initializeEditor]);

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value || '');
    }
  }, [value]);

  // Update editor language when prop changes
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Update editor theme when prop changes
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  // Show error state
  if (editorState.hasError) {
    return (
      <div className={`monaco-editor-container error ${className}`}>
        <div className="monaco-error">
          <h3>Editor Error</h3>
          <p>{editorState.errorMessage || 'Failed to load Monaco Editor'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`monaco-editor-container ${className}`}>
      {!editorState.isLoaded && (
        <div className='monaco-loading'>
          <div className='loading-spinner' />
          <p>Loading Monaco Editor...</p>
        </div>
      )}
      <div
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          opacity: editorState.isLoaded ? 1 : 0
        }}
      />
    </div>
  );
};

export default MonacoEditor;
