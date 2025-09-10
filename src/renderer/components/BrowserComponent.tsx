import React, { useState, useEffect, useCallback, useRef } from 'react';

// -----------------------------
// Type Definitions
// -----------------------------
interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  webContentsId?: number;
}

interface AutomationState {
  isAutomating: boolean;
  currentAction?: string;
  targetElement?: string;
  progress?: number;
  highlightedElements?: ElementHighlight[];
}

interface ElementHighlight {
  id: string;
  selector: string;
  bounds: { x: number; y: number; width: number; height: number };
  type: 'click' | 'fill' | 'extract' | 'hover' | 'focus';
  label?: string;
  color?: string;
}

interface BrowserComponentProps {
  className?: string;
  initialUrl?: string;
  onUrlChange?: (url: string) => void;
  onAutomationStateChange?: (state: AutomationState) => void;
}

// -----------------------------
// Component
// -----------------------------
const BrowserComponent: React.FC<BrowserComponentProps> = ({
  className = '',
  initialUrl = 'https://www.google.com',
  onUrlChange,
  onAutomationStateChange,
}) => {
  // Tab management
  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [activeTab, setActiveTab] = useState<BrowserTab | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);

  // Navigation state
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  // Automation UI state (sanitized line - removed non-printable chars)
  const [automationState, setAutomationState] = useState<AutomationState>({
    isAutomating: false,
  });
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  
  // WebContentsView state
  const [webContentsId, setWebContentsId] = useState<number | null>(null);
  const browserContainerRef = useRef<HTMLDivElement>(null);
  // Refs to avoid stale closures & prevent redundant initialization loops
  const initializedRef = useRef(false);
  const webContentsIdRef = useRef<number | null>(null);
  const activeTabIdRef = useRef<string | null>(null);

  // Sync refs with state
  useEffect(() => { webContentsIdRef.current = webContentsId; }, [webContentsId]);
  useEffect(() => { activeTabIdRef.current = activeTab?.id || null; }, [activeTab]);

  // Helper to update active tab state (avoids deep nesting warnings)
  const updateActiveTabState = useCallback((patch: Partial<BrowserTab>) => {
    const activeId = activeTabIdRef.current;
    if (!activeId) return;
    setTabs(prev => prev.map(tab => (tab.id === activeId ? { ...tab, ...patch } : tab)));
  }, []);

  // Assign webContents id to initial tab (extracted to avoid inline nested arrow in effect)
  const assignInitialWebContents = useCallback((initialTabId: string, id: number) => {
    setTabs(prev => prev.map(tab => (tab.id === initialTabId ? { ...tab, webContentsId: id } : tab)));
  }, []);

  // Highlight management helpers (reduce nesting depth inside promise chains)
  const addHighlight = useCallback((highlight: ElementHighlight) => {
    setAutomationState(prev => ({
      ...prev,
      highlightedElements: [...(prev.highlightedElements || []), highlight]
    }));
  }, []);

  const removeHighlight = useCallback((id: string) => {
    setAutomationState(prev => ({
      ...prev,
      highlightedElements: prev.highlightedElements?.filter(h => h.id !== id)
    }));
  }, []);

  // Reflect progress width without JSX inline style (lint rule compliance)
  useEffect(() => {
    if (progressBarRef.current && automationState.progress != null) {
      progressBarRef.current.style.width = `${automationState.progress}%`;
    }
  }, [automationState.progress]);

  /**
   * Initialize browser component and create initial tab
   */
  useEffect(() => {
    if (initializedRef.current) return; // hard guard
    initializedRef.current = true;

    const createdListeners: Array<{ channel: string; handler: (...args: any[]) => void }> = [];

    const register = (channel: string, handler: (...args: any[]) => void) => {
      if (window.electronAPI?.on) {
        window.electronAPI.on(channel, handler);
        createdListeners.push({ channel, handler });
      }
    };

    const initializeBrowser = async () => {
      try {
        const initialTab: BrowserTab = {
          id: `tab-${Date.now()}`,
          title: 'New Tab',
          url: initialUrl,
          isActive: true,
          isLoading: false,
          canGoBack: false,
          canGoForward: false
        };
        setTabs([initialTab]);
        setActiveTab(initialTab);
        activeTabIdRef.current = initialTab.id;

        if (window.electronAPI?.browser) {
          const result = await window.electronAPI.browser.createWebContentsView({
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
              enableRemoteModule: false,
              webSecurity: true
            }
          });
          if (result?.success && result.webContentsId) {
            const id = result.webContentsId;
            setWebContentsId(id);
            webContentsIdRef.current = id;
            await window.electronAPI.browser.navigateTo(initialUrl);
            assignInitialWebContents(initialTab.id, id);
          } else if (result && !result.success) {
            const errMsg = result.error || 'Unknown error';
            console.error('createWebContentsView failed:', errMsg);
          }
        }
      } catch (error) {
        console.error('Failed to initialize browser:', error);
      }
    };

    // Event handlers use refs to avoid dependency re-subscription loops
    register('browser-did-navigate', (data: any) => {
      if (data.webContentsId !== webContentsIdRef.current) return;
      setCurrentUrl(data.url);
      onUrlChange?.(data.url);
      updateActiveTabState({ url: data.url, title: data.title || 'Loading...', isLoading: false });
    });

    register('browser-did-start-loading', (data: any) => {
      if (data.webContentsId !== webContentsIdRef.current) return;
      setIsLoading(true);
      updateActiveTabState({ isLoading: true });
    });

    register('browser-did-stop-loading', (data: any) => {
      if (data.webContentsId !== webContentsIdRef.current) return;
      setIsLoading(false);
      updateActiveTabState({ isLoading: false });
    });

    register('browser-did-fail-load', (data: any) => {
      if (data.webContentsId !== webContentsIdRef.current) return;
      setIsLoading(false);
      updateActiveTabState({ isLoading: false, title: 'Failed to load' });
    });

    register('browser-navigation-state', (data: any) => {
      if (data.webContentsId !== webContentsIdRef.current) return;
      setCanGoBack(data.canGoBack);
      setCanGoForward(data.canGoForward);
      updateActiveTabState({ canGoBack: data.canGoBack, canGoForward: data.canGoForward });
    });

    initializeBrowser();

    return () => {
      // cleanup listeners
      if (createdListeners.length && (window as any).electronAPI?.removeListener) {
        createdListeners.forEach(l => {
          try { (window as any).electronAPI.removeListener(l.channel, l.handler); } catch { /* ignore */ }
        });
      }
      if (webContentsIdRef.current && window.electronAPI?.browser) {
        window.electronAPI.browser.destroyWebContentsView().catch(console.error);
      }
    };
  }, [initialUrl, onUrlChange]);

  // Event-driven; no manual navigation state polling required.

  /**
   * Navigate to URL
   */
  const navigateToUrl = useCallback(async (url: string, tabId?: string) => {
    try {
      if (!window.electronAPI?.browser) return;
      
      // Ensure URL has protocol
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      
      await window.electronAPI.browser.navigateTo(fullUrl);
      
      // Update tab state (loading state will be updated via events)
      const targetTabId = tabId || activeTab?.id;
      if (targetTabId) {
        setTabs(prev => prev.map(tab => 
          tab.id === targetTabId 
            ? { ...tab, url: fullUrl }
            : tab
        ));
      }
      
      // Note: Loading states and navigation completion are now handled via events
      
    } catch (error) {
      console.error('Navigation failed:', error);
      setIsLoading(false);
    }
  }, [activeTab]);

  /**
   * Handle navigation actions
   */
  const handleGoBack = useCallback(async () => {
    try {
      if (!window.electronAPI?.browser) return;
      await window.electronAPI.browser.goBack();
      // Navigation state updates will come via events
    } catch (error) {
      console.error('Go back failed:', error);
    }
  }, []);

  const handleGoForward = useCallback(async () => {
    try {
      if (!window.electronAPI?.browser) return;
      await window.electronAPI.browser.goForward();
      // Navigation state updates will come via events
    } catch (error) {
      console.error('Go forward failed:', error);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      if (!window.electronAPI?.browser) return;
      await window.electronAPI.browser.reload();
      // Loading state updates will come via events
    } catch (error) {
      console.error('Refresh failed:', error);
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle URL form submission
   */
  const handleUrlSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const url = formData.get('url') as string;
    if (url && activeTab) {
      navigateToUrl(url, activeTab.id);
    }
  }, [activeTab, navigateToUrl]);

  /**
   * Create new tab
   */
  const createNewTab = useCallback(() => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newTabId,
      title: 'New Tab',
      url: 'about:blank',
      isActive: false,
      isLoading: false,
      canGoBack: false,
      canGoForward: false
    };

    setTabs(prev => [...prev, newTab]);
  }, []);

  /**
   * Close tab
   */
  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const filteredTabs = prev.filter(tab => tab.id !== tabId);
      
      // If we're closing the active tab, activate another one
      if (activeTab?.id === tabId && filteredTabs.length > 0) {
        const newActiveTab = filteredTabs[Math.max(0, filteredTabs.length - 1)];
        setActiveTab(newActiveTab);
        navigateToUrl(newActiveTab.url, newActiveTab.id);
      } else if (filteredTabs.length === 0) {
        setActiveTab(null);
      }
      
      return filteredTabs;
    });
  }, [activeTab, navigateToUrl]);

  /**
   * Switch to tab
   */
  const switchToTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setTabs(prev => prev.map(t => ({ ...t, isActive: t.id === tabId })));
      setActiveTab(tab);
      navigateToUrl(tab.url, tabId);
    }
  }, [tabs, navigateToUrl]);

  /**
   * Execute automation script
   */
  const executeAutomation = useCallback(async (script: string, description?: string) => {
    try {
      if (!window.electronAPI?.browser) return;
      
      setAutomationState({
        isAutomating: true,
        currentAction: description || 'Executing automation...',
        progress: 0
      });

      onAutomationStateChange?.({
        isAutomating: true,
        currentAction: description || 'Executing automation...',
        progress: 0
      });

      const result = await window.electronAPI.browser.executeJavaScript(script);

      setAutomationState({
        isAutomating: false,
        progress: 100
      });

      onAutomationStateChange?.({
        isAutomating: false,
        progress: 100
      });

      return result;
    } catch (error) {
      console.error('Automation execution failed:', error);
      
      setAutomationState({
        isAutomating: false,
        progress: 0
      });

      onAutomationStateChange?.({
        isAutomating: false,
        progress: 0
      });

      throw error;
    }
  }, [onAutomationStateChange]);

  /**
   * Predefined automation actions
   */
  const automationActions = {
    fillForm: (selector: string, data: Record<string, string>) => {
      const script = `
        const form = document.querySelector('${selector}');
        if (form) {
          ${Object.entries(data).map(([key, value]) => 
            `const field = form.querySelector('[name="${key}"]'); 
             if (field) field.value = '${value}';`
          ).join('\n')}
          return { success: true, message: 'Form filled successfully' };
        }
        return { success: false, message: 'Form not found' };
      `;
      return executeAutomation(script, 'Filling form...');
    },

    clickElement: (selector: string) => {
      const script = `
        const element = document.querySelector('${selector}');
        if (element) {
          element.click();
          return { success: true, message: 'Element clicked' };
        }
        return { success: false, message: 'Element not found' };
      `;
      return executeAutomation(script, 'Clicking element...');
    },

    extractData: (selector: string) => {
      const script = `
        const elements = document.querySelectorAll('${selector}');
        return Array.from(elements).map(el => ({
          text: el.textContent?.trim(),
          href: el.href,
          value: el.value,
          tagName: el.tagName
        }));
      `;
      return executeAutomation(script, 'Extracting data...');
    },

    highlightElement: (selector: string, type: ElementHighlight['type'] = 'hover', label?: string) => {
      const script = `
        const element = document.querySelector('${selector}');
        if (element) {
          const rect = element.getBoundingClientRect();
          return {
            success: true,
            bounds: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            selector: '${selector}',
            type: '${type}',
            label: '${label || selector}'
          };
        }
        return { success: false, message: 'Element not found' };
      `;
      
      return executeAutomation(script, `Highlighting ${selector}...`).then(result => {
        if (result.success) {
          const highlight: ElementHighlight = {
            id: `highlight-${Date.now()}`,
            selector: result.selector,
            bounds: result.bounds,
            type: result.type,
            label: result.label
          };
          
          addHighlight(highlight);
          setTimeout(() => removeHighlight(highlight.id), 3000);
        }
        return result;
      });
    },

    clearHighlights: () => setAutomationState(prev => ({ ...prev, highlightedElements: [] }))
  };

  // Apply highlight element positioning via CSS variables (avoid inline style object in JSX)
  useEffect(() => {
    if (!automationState.highlightedElements || automationState.highlightedElements.length === 0) return;
    requestAnimationFrame(() => {
      automationState.highlightedElements?.forEach(h => {
        const el = document.querySelector(`.element-highlight[data-id="${h.id}"]`);
        if (el instanceof HTMLElement) {
          el.style.setProperty('--x', `${h.bounds.x}px`);
          el.style.setProperty('--y', `${h.bounds.y}px`);
          el.style.setProperty('--w', `${h.bounds.width}px`);
          el.style.setProperty('--h', `${h.bounds.height}px`);
        }
      });
    });
  }, [automationState.highlightedElements]);

  // updateActiveTabState already defined earlier.
  return (
    <div className={`browser-component ${className}`}>
      {/* Tab Bar */}
        <div className="browser-tabs" aria-label="Browser Tabs">
        {tabs.map((tab) => (
          <div key={tab.id} className={`browser-tab ${tab.isActive ? 'active' : ''}`}> 
            <button
              type="button"
              className="tab-main"
              onClick={() => switchToTab(tab.id)}
            >
              <span className="tab-title">{tab.title}</span>
              {tab.isLoading && <span className="tab-loading" aria-label="Loading">⟳</span>}
            </button>
            <button
              type="button"
              className="tab-close"
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
              aria-label={`Close ${tab.title}`}
            >
              ×
            </button>
          </div>
        ))}
        <button className="new-tab-button" onClick={createNewTab} aria-label="New tab" type="button">
          +
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="browser-navigation">
        <div className="nav-controls">
          <button
            className={`nav-button ${!canGoBack ? 'disabled' : ''}`}
            onClick={handleGoBack}
            disabled={!canGoBack}
            aria-label="Go back"
          >
            ←
          </button>
          <button
            className={`nav-button ${!canGoForward ? 'disabled' : ''}`}
            onClick={handleGoForward}
            disabled={!canGoForward}
            aria-label="Go forward"
          >
            →
          </button>
          <button className="nav-button" onClick={handleRefresh} aria-label="Refresh">
            ⟳
          </button>
        </div>

        <form className="url-bar" onSubmit={handleUrlSubmit}>
          <input
            type="text"
            name="url"
            defaultValue={currentUrl}
            placeholder="Enter URL or search..."
            className="url-input"
            autoComplete="off"
          />
          <button type="submit" className="url-submit" aria-label="Navigate">
            Go
          </button>
        </form>

        <div className="browser-status">
          {isLoading && (
            <div className="loading-indicator" aria-label="Loading">
              ⟳
            </div>
          )}
        </div>
      </div>

      {/* Browser Content Area */}
      <div 
        ref={browserContainerRef}
        className="browser-content"
      >
        {/* Automation Overlay */}
        {automationState.isAutomating && (
          <div className="automation-overlay">
            <div className="automation-status">
              <div className="automation-message">
                {automationState.currentAction}
              </div>
              {automationState.progress !== undefined && (
                <div className="automation-progress">
                  <div className="progress-bar" ref={progressBarRef} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Element Highlights Overlay */}
        {automationState.highlightedElements && automationState.highlightedElements.length > 0 && (
          <div className="element-highlights-overlay">
            {automationState.highlightedElements.map((highlight) => (
              <div
                key={highlight.id}
                data-id={highlight.id}
                className={`element-highlight highlight-${highlight.type}`}
              >
                {highlight.label && <div className="highlight-label">{highlight.label}</div>}
              </div>
            ))}
          </div>
        )}

        {/* WebContentsView will be attached here by the main process */}
        <div id={`webcontents-container-${activeTab?.id || 'default'}`} className="webcontents-view-container" />
      </div>

      {/* Automation Controls (Development/Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="automation-controls">
          <button onClick={() => automationActions.clickElement('button')}>
            Test Click
          </button>
          <button onClick={() => automationActions.extractData('a')}>
            Extract Links
          </button>
          <button onClick={() => executeAutomation('document.title', 'Get page title')}>
            Get Title
          </button>
        </div>
      )}
    </div>
  );
};

export default BrowserComponent;
