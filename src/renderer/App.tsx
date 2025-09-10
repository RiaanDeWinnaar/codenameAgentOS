import React, { useState, useCallback, useEffect, useRef } from 'react';

// Augment minimal type for new browser methods (runtime already exposed via preload)
declare global {
  interface Window { // eslint-disable-line @typescript-eslint/consistent-type-definitions
    electronAPI?: any; // Using any to avoid import cycle; preload defines full shape
  }
}
import MonacoEditor from './components/MonacoEditor';
import BrowserComponent from './components/BrowserComponent';
import TerminalModule from './components/Terminal';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Diagnostic logging to trace React error #130 root cause (invalid element type)
/* eslint-disable no-console */
console.log('[Diag] Imported MonacoEditor:', MonacoEditor);
console.log('[Diag] MonacoEditor type:', typeof MonacoEditor);
console.log('[Diag] MonacoEditor keys:', MonacoEditor && Object.keys(MonacoEditor as any));
console.log('[Diag] Imported BrowserComponent:', BrowserComponent);
console.log('[Diag] BrowserComponent type:', typeof BrowserComponent);
console.log('[Diag] BrowserComponent keys:', BrowserComponent && Object.keys(BrowserComponent as any));
// Terminal diagnostic + safe resolution (guards React error #130)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolveReactComponent = (mod: any) => {
  if (!mod) return null;
  if (typeof mod === 'function') return mod; // already a component
  if (mod.__esModule && typeof mod.default === 'function') return mod.default; // ESM default
  // Heuristic: pick first function export
  for (const k of Object.keys(mod)) {
    const val = (mod as any)[k];
    if (typeof val === 'function') return val;
  }
  return null;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ResolvedTerminalComponent: any = resolveReactComponent(TerminalModule);
console.log('[Diag] Terminal raw import:', TerminalModule);
console.log('[Diag] Terminal resolved component:', ResolvedTerminalComponent);
console.log('[Diag] Terminal resolved type:', typeof ResolvedTerminalComponent);
// Build metadata injected by webpack DefinePlugin (hash + timestamp)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const __BUILD_METADATA__: any; // defined at build time
let __YOLO_BUILD_META: { hash: string; time: string } | null = null;
try {
  // eslint-disable-next-line no-console
  console.log('[Build] Metadata:', __BUILD_METADATA__);
  __YOLO_BUILD_META = __BUILD_METADATA__;
} catch (e) {
  // eslint-disable-next-line no-console
  console.log('[Build] Metadata unavailable');
}
// Resolve potential module interop (case where default export is nested under .default producing React error #130)
// React error #130 occurs if we attempt to render a plain object instead of a function/class.
// Defensive resolution ensures compatibility across CJS/ESM interop boundaries.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Dynamic resolution for Terminal component with additional unwrapping patterns
// const ResolvedTerminalComponent = null; // disabled
try { // log react versions
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const reactPkg = require('react/package.json');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const reactDomPkg = require('react-dom/package.json');
  console.log('[Diag] React version:', reactPkg.version, 'ReactDOM version:', reactDomPkg.version);
} catch (e) {
  console.log('[Diag] Could not read React package versions', e);
}
/* eslint-enable no-console */

/**
 * YOLO-Browser Main Application Component
 * 
 * This is the main application component that integrates:
 * - Monaco Editor for code editing with full language support
 * - Browser Component with native Electron WebContentsView automation
 * - Terminal Component with xterm.js and node-pty integration
 * 
 * The three components share context and can interact with each other
 * for a complete agent-native development environment.
 */
const App: React.FC = () => {
  // Editor state
  const [editorContent, setEditorContent] = useState<string>(`// Welcome to YOLO-Browser
// This is the integrated development environment for autonomous web automation

console.log('Hello from YOLO-Browser!');

// Example TypeScript with full IntelliSense
interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

// This code runs in the Monaco Editor with full TypeScript support
function greetUsers(userList: User[]): string {
  return userList.map(user => \`Hello, \${user.name}!\`).join('\\n');
}

console.log(greetUsers(users));
`);

  // Browser state
  const [currentUrl, setCurrentUrl] = useState<string>('https://www.google.com');
  const [isAutomating, setIsAutomating] = useState<boolean>(false);

  // Terminal state
    // Terminal lifecycle/state
    const [terminalMounted, setTerminalMounted] = useState(false); // becomes true when user first opens panel
    const [terminalReady, setTerminalReady] = useState(false); // set by Terminal onTerminalReady callback

  // UI Layout state
  const [activePanel, setActivePanel] = useState<'editor' | 'browser' | 'terminal'>('editor');
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const browserPanelRef = useRef<HTMLDivElement | null>(null);

  // Manage WebContentsView visibility & bounds when switching panels or resizing
  useEffect(() => {
    const api = window.electronAPI?.browser;
    if (!api) return;

    const updateBounds = () => {
      if (activePanel !== 'browser') return; // only resize when visible
      if (!browserPanelRef.current) return;
      const panel = browserPanelRef.current.querySelector('.panel-content');
      if (!(panel instanceof HTMLElement)) return;
      const rect = panel.getBoundingClientRect();
      // Y offset relative to window (rect already absolute in viewport)
      api.updateBounds({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.max(50, Math.round(rect.width)),
        height: Math.max(50, Math.round(rect.height)),
      });
    };

    if (activePanel === 'browser') {
      api.show().then(() => updateBounds());
      // short delayed second update to catch layout transitions
      setTimeout(updateBounds, 150);
    } else {
      api.hide();
    }

    window.addEventListener('resize', updateBounds);
    return () => {
      window.removeEventListener('resize', updateBounds);
    };
  }, [activePanel, layout]);

  // Mount terminal lazily only when user first visits panel
  useEffect(() => {
    if (activePanel === 'terminal' && !terminalMounted) {
      setTerminalMounted(true);
    }
  }, [activePanel, terminalMounted]);

  /**
   * Handle editor content changes
   */
  const handleEditorChange = useCallback((value: string | undefined) => {
    setEditorContent(value || '');
  }, []);

  /**
   * Handle editor save action
   */
  const handleEditorSave = useCallback((value: string) => {
    console.log('Saving editor content:', value.length, 'characters');
    // In a real implementation, this would save to the file system
    // via the Electron main process
  }, []);

  /**
   * Handle browser URL changes
   */
  const handleUrlChange = useCallback((url: string) => {
    setCurrentUrl(url);
  }, []);

  /**
   * Handle automation state changes
   */
  const handleAutomationStateChange = useCallback((state: any) => {
    setIsAutomating(state.isAutomating);
  }, []);

  /**
   * Handle terminal ready state
   */

  /**
   * Execute code from editor in browser context
   */
  const executeInBrowser = useCallback(async () => {
    try {
      if (window.electronAPI?.browser) {
        const result = await window.electronAPI.browser.executeJavaScript(editorContent);
        console.log('Code execution result:', result);
        return result;
      }
    } catch (error) {
      console.error('Failed to execute code in browser:', error);
    }
  }, [editorContent]);

  return (
    <div className={`app ${layout}`}>
      {/* Header with controls */}
      <header className="app-header">
        <div className="app-title">
          <h1>YOLO-Browser</h1>
          <span className="version">v1.0.0-alpha</span>
          {__YOLO_BUILD_META && (
            <span
              className="build-badge"
              title={`Build hash ${__YOLO_BUILD_META.hash} @ ${new Date(__YOLO_BUILD_META.time).toLocaleString()}`}
            >
              {__YOLO_BUILD_META.hash}
            </span>
          )}
        </div>
        
        <div className="app-controls">
          <div className="layout-controls">
            <button
              className={layout === 'horizontal' ? 'active' : ''}
              onClick={() => setLayout('horizontal')}
              title="Horizontal Layout"
            >
              ⬜
            </button>
            <button
              className={layout === 'vertical' ? 'active' : ''}
              onClick={() => setLayout('vertical')}
              title="Vertical Layout"
            >
              ▢
            </button>
          </div>
          
          <div className="panel-controls">
            <button
              className={activePanel === 'editor' ? 'active' : ''}
              onClick={() => setActivePanel('editor')}
              title="Show Editor"
            >
              📝 Editor
            </button>
            <button
              className={activePanel === 'browser' ? 'active' : ''}
              onClick={() => setActivePanel('browser')}
              title="Show Browser"
            >
              🌐 Browser
            </button>
            <button
              className={activePanel === 'terminal' ? 'active' : ''}
              onClick={() => setActivePanel('terminal')}
              title="Show Terminal"
            >
              💻 Terminal
            </button>
          </div>

          <button 
            className="execute-button"
            onClick={executeInBrowser}
            disabled={isAutomating}
            title="Execute code in browser"
          >
            ▶️ Execute
          </button>
        </div>
      </header>

      {/* Status Bar */}
      <div className="app-status">
        <div className="status-section">
          <span className="status-label">Editor:</span>
          <span className="status-value">{editorContent.length} chars</span>
        </div>
        <div className="status-section">
          <span className="status-label">Browser:</span>
          <span className="status-value">{currentUrl}</span>
        </div>
        <div className="status-section">
          <span className="status-label">Terminal:</span>
          <span className={`status-value ${terminalReady ? 'ready' : terminalMounted ? 'connecting' : 'idle'}`}>
            {terminalReady ? 'Ready' : terminalMounted ? 'Connecting...' : 'Idle'}
          </span>
        </div>
        {isAutomating && (
          <div className="status-section automation">
            <span className="status-label">Automation:</span>
            <span className="status-value">Running...</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="app-main">
        {/* Editor Panel */}
        <div className={`panel editor-panel ${activePanel === 'editor' ? 'active' : ''}`}>
          <div className="panel-header">
            <h2>Code Editor</h2>
            <div className="panel-tools">
              <button title="New File">📄</button>
              <button title="Open File">📁</button>
              <button title="Save File" onClick={() => handleEditorSave(editorContent)}>💾</button>
            </div>
          </div>
          <div className="panel-content">
            <MonacoEditor
              value={editorContent}
              language="typescript"
              theme="yolo-dark"
              onChange={handleEditorChange}
              onSave={handleEditorSave}
              enableFileManagement={true}
              enableThemeToggle={true}
              className="main-editor"
            />
          </div>
        </div>

        {/* Browser Panel */}
  <div ref={browserPanelRef} className={`panel browser-panel ${activePanel === 'browser' ? 'active' : ''}`}>
          <div className="panel-header">
            <h2>Browser</h2>
            <div className="panel-tools">
              <button title="New Tab">🗗</button>
              <button title="DevTools">🔧</button>
              <button title="Automation Mode">🤖</button>
            </div>
          </div>
          <div className="panel-content">
            <BrowserComponent
              initialUrl={currentUrl}
              onUrlChange={handleUrlChange}
              onAutomationStateChange={handleAutomationStateChange}
              className="main-browser"
            />
          </div>
        </div>

        {/* Terminal Panel */}
        <div className={`panel terminal-panel ${activePanel === 'terminal' ? 'active' : ''}`}>
          <div className="panel-header">
            <h2>Terminal</h2>
            <div className="panel-tools">
              <button title="New Shell">🖥️</button>
              <button title="Split Terminal">⫿</button>
              <button title="Settings">⚙️</button>
            </div>
          </div>
          <div className="panel-content">
            {terminalMounted ? (
              <ErrorBoundary fallback={<div className="terminal-loading">Terminal failed to load</div>}>
                {ResolvedTerminalComponent ? (
                <ResolvedTerminalComponent
                  className="main-terminal"
                  onTerminalReady={() => setTerminalReady(true)}
                />
                ) : (
                  <div className="terminal-loading">Terminal component unresolved (import issue)</div>
                )}
              </ErrorBoundary>
            ) : (
              <div className="terminal-disabled-message">Open Terminal panel to initialize...</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
