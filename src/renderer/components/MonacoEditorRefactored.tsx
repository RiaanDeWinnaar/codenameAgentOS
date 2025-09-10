/**
 * Monaco Editor Component (Refactored)
 * 
 * Now uses the MonacoEditorService for platform-agnostic initialization
 * This component is future-proofed for web, mobile, and other deployment targets
 */

import React, { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { MonacoEditorService } from './monaco/MonacoService';
import './MonacoEditor.css';

interface MonacoEditorProps {
  language?: string;
  value?: string;
  onChange?: (value: string) => void;
  theme?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  language = 'typescript',
  value = '// Welcome to YOLO-Browser!\n// This is the Monaco Editor integrated into the platform.\n\nconsole.log("Hello, YOLO-Browser!");',
  onChange,
  theme = 'vs-dark',
  options = {},
  onMount
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initInfo, setInitInfo] = useState<string>('');

  const supportedLanguages = [
    'typescript', 'javascript', 'html', 'css', 'scss', 'less', 
    'json', 'xml', 'markdown', 'yaml', 'python', 'java', 
    'csharp', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 
    'swift', 'kotlin', 'scala', 'r', 'sql', 'shell', 
    'powershell', 'dockerfile', 'plaintext'
  ];

  const handleLanguageChange = (newLanguage: string) => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage);
      }
    }
  };

  useEffect(() => {
    const initializeMonaco = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Initializing Monaco Editor with platform detection...');
        
        const monacoService = MonacoEditorService.getInstance();
        const result = await monacoService.initialize({
          enableTelemetry: true,
          fallbackStrategy: 'minimal'
        });

        if (!result.success) {
          throw new Error(`Monaco initialization failed: ${result.errors.join(', ')}`);
        }

        // Set initialization info for display
        setInitInfo(`Platform: ${result.platform} | Strategy: ${result.strategy} | Init time: ${result.initTime.toFixed(1)}ms`);

        if (result.warnings.length > 0) {
          console.warn('Monaco initialization warnings:', result.warnings);
        }

        console.log('Monaco Editor initialized successfully:', result);

        // Create editor instance
        if (containerRef.current) {
          const editor = monacoService.createEditor(containerRef.current, {
            value,
            language,
            theme,
            ...options
          });

          editorRef.current = editor;

          // Set up change listener
          editor.onDidChangeModelContent(() => {
            const currentValue = editor.getValue();
            onChange?.(currentValue);
          });

          // Call onMount callback
          onMount?.(editor);

          setIsLoading(false);
          console.log('Monaco Editor created and mounted successfully');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Monaco Editor initialization failed:', err);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    initializeMonaco();

    // Cleanup
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []); // Empty dependency array - initialize once

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Update editor language when prop changes
  useEffect(() => {
    if (editorRef.current) {
      handleLanguageChange(language);
    }
  }, [language]);

  // Update editor theme when prop changes
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  if (error) {
    return (
      <div className="monaco-editor-container">
        <div className="monaco-editor-error">
          <h3>Monaco Editor Failed to Load</h3>
          <p>{error}</p>
          <details>
            <summary>Technical Details</summary>
            <pre>{JSON.stringify(MonacoEditorService.getInstance().getInitResult(), null, 2)}</pre>
          </details>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="monaco-editor-container">
        <div className="monaco-editor-loading">
          <div className="spinner"></div>
          <p>Initializing Monaco Editor...</p>
          <small>Platform detection and worker setup in progress</small>
        </div>
      </div>
    );
  }

  return (
    <div className="monaco-editor-container">
      {/* Editor Controls */}
      <div className="monaco-editor-toolbar">
        <div className="monaco-editor-language-selector">
          <label htmlFor="language-select">Language:</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="monaco-editor-info">
          <small>{initInfo}</small>
        </div>
      </div>

      {/* Editor Container */}
      <div
        ref={containerRef}
        className="monaco-editor"
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};
