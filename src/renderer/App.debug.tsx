import React, { useState, useCallback } from 'react';
import './App.css';

// Test imports one by one to find the problematic component
import MonacoEditor from './components/MonacoEditor.minimal';
console.log('App.debug imported MonacoEditor:', MonacoEditor);
console.log('MonacoEditor type:', typeof MonacoEditor);
console.log('MonacoEditor constructor name:', MonacoEditor?.constructor?.name);
// import BrowserComponent from './components/BrowserComponent';
// import TerminalComponent from './components/Terminal';

/**
 * Debug App Component - Testing imports one by one
 */
const App: React.FC = () => {
  const [editorContent, setEditorContent] = useState<string>('// Test content');

  const handleEditorChange = useCallback((value: string | undefined) => {
    setEditorContent(value || '');
  }, []);

  const handleEditorSave = useCallback((value: string) => {
    console.log('Saving editor content:', value.length, 'characters');
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>YOLO-Browser (Debug)</h1>
      </header>

      <main className="app-main">
        <div className="panel editor-panel active">
          <h2>Monaco Editor Test (Minimal)</h2>
          <MonacoEditor />
        </div>
      </main>
    </div>
  );
};

export default App;
