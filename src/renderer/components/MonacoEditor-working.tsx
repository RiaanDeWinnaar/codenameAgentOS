import React, { useState, useRef, useCallback, useEffect } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
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

      // Configure basic TypeScript settings with minimal errors
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
          strict: false,
          skipLibCheck: true,
        });

        // Reduce diagnostic noise
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          noSuggestionDiagnostics: false,
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

  // Simplified editor options
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
    links: true,
    colorDecorators: true,
  };

  // Show error state
  if (editorState.hasError) {
    return React.createElement('div', 
      { className: `monaco-editor-container error ${className}` },
      React.createElement('div', { className: 'monaco-error' },
        React.createElement('h3', null, 'Editor Error'),
        React.createElement('p', null, editorState.errorMessage || 'Failed to load Monaco Editor'),
        React.createElement('button', 
          { 
            onClick: () => window.location.reload(),
            className: 'retry-button'
          },
          'Retry'
        )
      )
    );
  }

  return React.createElement('div', 
    { className: `monaco-editor-container ${className}` },
    !editorState.isLoaded && React.createElement('div', { className: 'monaco-loading' },
      React.createElement('div', { className: 'loading-spinner' }),
      React.createElement('p', null, 'Loading Monaco Editor...')
    ),
    React.createElement(Editor, {
      height: '100%',
      width: '100%',
      language: language,
      value: value,
      theme: theme,
      options: editorOptions,
      onMount: handleEditorDidMount,
      onChange: handleEditorChange,
      loading: React.createElement('div', { className: 'monaco-loading' },
        React.createElement('div', { className: 'loading-spinner' }),
        React.createElement('p', null, 'Initializing editor...')
      )
    })
  );
};

export default MonacoEditor;
