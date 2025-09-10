// Type definitions for Electron API in renderer process

export interface ElementHighlight {
  id: string;
  elementSelector: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'click' | 'fill' | 'hover' | 'extract';
  visible: boolean;
}

export interface ElectronAPI {
  // App information
  getVersion: () => Promise<string>;
  getName: () => Promise<string>;
  isPackaged: () => Promise<boolean>;

  // File system operations
  openFile: () => Promise<Electron.OpenDialogReturnValue>;
  openDirectory: () => Promise<Electron.OpenDialogReturnValue>;

  // Window management
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  // Logging
  logInfo: (message: string) => Promise<void>;
  getAppInfo: () => Promise<{
    name: string;
    version: string;
    isPackaged: boolean;
  }>;
  logError: (message: string) => void;

  // Event listeners
  on: (channel: string, callback: (data: any) => void) => void;
  off: (channel: string, callback: (data: any) => void) => void;
  once: (channel: string, callback: (data: any) => void) => void;

  // YOLO-Browser features
  automation: {
    isYoloModeEnabled: () => Promise<boolean>;
    getTrustLevel: () => Promise<string>;
  };

  browser: {
    // WebContentsView management
    createWebContentsView: (options: any) => Promise<{ success: boolean; webContentsView?: any; webContentsId?: number }>;
    destroyWebContentsView: () => Promise<void>;
    
    // Navigation
    getCurrentUrl: () => Promise<string>;
    navigateTo: (url: string) => Promise<void>;
    goBack: () => Promise<void>;
    goForward: () => Promise<void>;
    reload: () => Promise<void>;
    getNavigationState: () => Promise<{
      canGoBack: boolean;
      canGoForward: boolean;
      isLoading: boolean;
      url: string;
    }>;
    getPageInfo: () => Promise<{
      title: string;
      url: string;
      isLoading: boolean;
      favicon?: string;
    }>;
    
    // DOM and automation
    executeJavaScript: (script: string) => Promise<any>;
    
    // Tab management
    createTab: (url?: string) => Promise<string>;
    closeTab: (tabId: string) => Promise<void>;
    switchToTab: (tabId: string) => Promise<void>;
  };

  ai: {
    isConnected: () => Promise<boolean>;
    getProviders: () => Promise<string[]>;
  };

  terminal: {
    // Terminal management
    createShell: (terminalId: string, shellType: 'pwsh' | 'cmd' | 'bash') => Promise<void>;
    killShell: (terminalId: string) => Promise<void>;
    sendInput: (terminalId: string, data: string) => Promise<void>;
    resize: (terminalId: string, cols: number, rows: number) => Promise<void>;
    
    // Event listeners
    onData: (callback: (event: any, terminalId: string, data: string) => void) => void;
    onExit: (callback: (event: any, terminalId: string, exitCode: number) => void) => void;
    removeListener: (event: string, callback: any) => void;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
