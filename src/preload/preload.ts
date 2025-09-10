import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface for type safety
interface ElectronAPI {
  // App information
  getVersion: () => Promise<string>;
  getName: () => Promise<string>;
  isPackaged: () => Promise<boolean>;
  getAppInfo: () => Promise<{
    name: string;
    version: string;
    isPackaged: boolean;
  }>;

  // File system operations
  openFile: () => Promise<Electron.OpenDialogReturnValue>;
  openDirectory: () => Promise<Electron.OpenDialogReturnValue>;

  // Window management
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  // Logging
  logInfo: (message: string) => void;
  logError: (message: string) => void;

  // Event listeners
  on: (channel: string, callback: (data: any) => void) => void;
  off: (channel: string, callback: (data: any) => void) => void;
  once: (channel: string, callback: (data: any) => void) => void;

  // Future expansion points for YOLO-Browser features
  automation: {
    // Placeholder for automation API
    isYoloModeEnabled: () => Promise<boolean>;
    getTrustLevel: () => Promise<string>;
  };

  browser: {
    // WebContentsView management
    createWebContentsView: (options: any) => Promise<{ success: boolean; webContentsView?: any; webContentsId?: number }>;
    destroyWebContentsView: () => Promise<void>;
  hide: () => Promise<any>;
  show: () => Promise<any>;
  updateBounds: (bounds: { x: number; y: number; width: number; height: number }) => Promise<any>;
    
    // Navigation
    getCurrentUrl: () => Promise<string>;
    navigateTo: (url: string) => Promise<void>;
    goBack: () => Promise<void>;
    goForward: () => Promise<void>;
    reload: () => Promise<void>;
    
    // Navigation state and page info
    getNavigationState: () => Promise<any>;
    getPageInfo: () => Promise<any>;
    
    // DOM and automation
    executeJavaScript: (script: string) => Promise<any>;
    
    // Tab management
    createTab: (url?: string) => Promise<string>;
    closeTab: (tabId: string) => Promise<void>;
    switchToTab: (tabId: string) => Promise<void>;
  };

  ai: {
    // Placeholder for AI integration API
    isConnected: () => Promise<boolean>;
    getProviders: () => Promise<string[]>;
  };

  terminal?: {
    // Terminal management
    createShell: (terminalId: string, shellType: string) => Promise<void>;
    sendInput: (terminalId: string, data: string) => Promise<void>;
    killShell: (terminalId: string) => Promise<void>;
    resize: (terminalId: string, cols: number, rows: number) => Promise<void>;
    onData: (callback: (event: any, terminalId: string, data: string) => void) => void;
    onExit: (callback: (event: any, terminalId: string, exitCode: number) => void) => void;
    removeListener: (channel: string, callback: any) => void;
  };
}

// Define the API implementation
const electronAPI: ElectronAPI = {
  // App information
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getName: () => ipcRenderer.invoke('app:getName'),
  isPackaged: () => ipcRenderer.invoke('app:isPackaged'),
  getAppInfo: () => ipcRenderer.invoke('app:getAppInfo'),

  // File system operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),

  // Window management
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Logging
  logInfo: (message: string) => ipcRenderer.send('log:info', message),
  logError: (message: string) => ipcRenderer.send('log:error', message),

  // Event listeners with validation
  on: (channel: string, callback: (data: any) => void) => {
    const validChannels = [
      'yolo-mode-changed',
      'trust-level-changed',
      'automation-status',
      'browser-navigation',
      'ai-status-changed',
      'file-changed',
      'project-loaded',
      // Browser events
      'browser-did-navigate',
      'browser-dom-ready',
      'browser-did-start-loading',
      'browser-did-stop-loading',
      'browser-did-fail-load',
      'browser-navigation-state',
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, data) => callback(data));
    } else {
      console.warn(`Invalid IPC channel: ${channel}`);
    }
  },

  off: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  once: (channel: string, callback: (data: any) => void) => {
    const validChannels = [
      'yolo-mode-changed',
      'trust-level-changed',
      'automation-status',
      'browser-navigation',
      'ai-status-changed',
      'file-changed',
      'project-loaded',
      // Browser events
      'browser-did-navigate',
      'browser-dom-ready',
      'browser-did-start-loading',
      'browser-did-stop-loading',
      'browser-did-fail-load',
      'browser-navigation-state',
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, (_, data) => callback(data));
    } else {
      console.warn(`Invalid IPC channel: ${channel}`);
    }
  },

  // Future expansion points for YOLO-Browser features
  automation: {
    isYoloModeEnabled: () => Promise.resolve(false), // Placeholder implementation
    getTrustLevel: () => Promise.resolve('none'), // Placeholder implementation
  },

  browser: {
    // WebContentsView management
  // Returns: { success: boolean; webContentsId?: number; error?: string }
  createWebContentsView: (options: any) => ipcRenderer.invoke('browser:createWebContentsView', options),
    destroyWebContentsView: () => ipcRenderer.invoke('browser:destroyWebContentsView'),
  hide: () => ipcRenderer.invoke('browser:hideWebContentsView'),
  show: () => ipcRenderer.invoke('browser:showWebContentsView'),
  updateBounds: (bounds: { x: number; y: number; width: number; height: number }) => ipcRenderer.invoke('browser:updateBounds', bounds),
    
    // Navigation
    getCurrentUrl: () => ipcRenderer.invoke('browser:getCurrentUrl'),
    navigateTo: (url: string) => ipcRenderer.invoke('browser:navigateTo', url),
    goBack: () => ipcRenderer.invoke('browser:goBack'),
    goForward: () => ipcRenderer.invoke('browser:goForward'),
    reload: () => ipcRenderer.invoke('browser:reload'),
    
    // Navigation state and page info
    getNavigationState: () => ipcRenderer.invoke('browser:getNavigationState'),
    getPageInfo: () => ipcRenderer.invoke('browser:getPageInfo'),
    
    // DOM and automation
    executeJavaScript: (script: string) => ipcRenderer.invoke('browser:executeJavaScript', script),
    
    // Tab management (placeholder for future implementation)
    createTab: (url?: string) => ipcRenderer.invoke('browser:createTab', url),
    closeTab: (tabId: string) => ipcRenderer.invoke('browser:closeTab', tabId),
    switchToTab: (tabId: string) => ipcRenderer.invoke('browser:switchToTab', tabId),
  },

  ai: {
    isConnected: () => Promise.resolve(false), // Placeholder implementation
    getProviders: () => Promise.resolve([]), // Placeholder implementation
  },

  // Terminal placeholder - will be implemented when main process is ready
  terminal: undefined,
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Log successful preload
console.log('Preload script loaded successfully');

// Export type for use in renderer process
export type { ElectronAPI };
