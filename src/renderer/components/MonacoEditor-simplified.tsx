import React, { useState, useRef, useCallback, useEffect } from 'react';
import Editor, { OnMount, OnChange, loader } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import './MonacoEditor.css';

export interface MonacoEditorProps {
  value?: string;
  language?: string;
  theme?: 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light';
  readOnly?: boolean;
  minimap?: boolean;
  wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  fontSize?: number;
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
  onChange?: (value: string | undefined) => void;
  onSave?: (value: string) => void;
  className?: string;
}

interface EditorState {
  isLoaded: boolean;
  hasError: boolean;
  errorMessage?: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value = '',
  language = 'typescript',
  theme = 'vs-dark',
  readOnly = false,
  minimap = true,
  wordWrap = 'on',
  fontSize = 14,
  lineNumbers = 'on',
  onChange,
  onSave,
  className = '',
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    isLoaded: false,
    hasError: false,
  });

  // Configure Monaco for Electron
  useEffect(() => {
    // Set Monaco environment for workers
    if (typeof window !== 'undefined') {
      (window as any).MonacoEnvironment = {
        getWorkerUrl: function (moduleId: string, label: string) {
          console.log('Monaco requesting worker:', { moduleId, label });
          return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/'
            };
            importScripts('${window.location.origin}/monaco-editor/min/vs/base/worker/workerMain.js');
          `)}`;
        }
      };
    }
  }, []);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    
    try {
      console.log('Monaco Editor mounted successfully');
      
      // Set theme
      monaco.editor.setTheme(theme);
      
      // Add Ctrl+S/Cmd+S save shortcut
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        if (onSave) {
          const currentValue = editor.getValue();
          onSave(currentValue);
        }
      });

      // Configure basic TypeScript settings
      if (language === 'typescript' || language === 'javascript') {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          allowJs: true,
          strict: false, // Disable strict mode for now to reduce errors
          skipLibCheck: true,
        });

        // Disable some diagnostics to reduce noise
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true, // Disable semantic validation temporarily
          noSyntaxValidation: false,
          noSuggestionDiagnostics: true,
        });
      }

      setEditorState({
        isLoaded: true,
        hasError: false,
      });

    } catch (error) {
      console.error('Error configuring Monaco Editor:', error);
      setEditorState({
        isLoaded: false,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [theme, language, onSave]);

  const handleEditorChange: OnChange = useCallback((value) => {
    if (onChange) {
      onChange(value);
    }
  }, [onChange]);

  // Editor options
  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
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
    foldingImportsByDefault: false,
    links: true,
    colorDecorators: true,
    codeActionsOnSave: {
      'source.fixAll': 'explicit',
    },
  };

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
        <div className="monaco-loading">
          <div className="loading-spinner"></div>
          <p>Loading Monaco Editor...</p>
        </div>
      )}
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={value}
        theme={theme}
        options={editorOptions}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        loading={
          <div className="monaco-loading">
            <div className="loading-spinner"></div>
            <p>Initializing editor...</p>
          </div>
        }
      />
    </div>
  );
};

export default MonacoEditor;
