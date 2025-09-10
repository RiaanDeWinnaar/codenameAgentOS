/**
 * Shared types used across main and renderer processes
 */

// IPC Channel definitions
export interface IPCChannels {
  // App-level channels
  APP_GET_VERSION: 'app:getVersion';
  APP_GET_NAME: 'app:getName';
  APP_IS_PACKAGED: 'app:isPackaged';

  // Dialog channels
  DIALOG_OPEN_FILE: 'dialog:openFile';
  DIALOG_OPEN_DIRECTORY: 'dialog:openDirectory';

  // Window management channels
  WINDOW_MINIMIZE: 'window:minimize';
  WINDOW_MAXIMIZE: 'window:maximize';
  WINDOW_CLOSE: 'window:close';

  // Logging channels
  LOG_INFO: 'log:info';
  LOG_ERROR: 'log:error';
}

// File system types
export interface FileSelection {
  canceled: boolean;
  filePaths: string[];
}

export interface DirectorySelection {
  canceled: boolean;
  filePaths: string[];
}

// Window state
export interface WindowState {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isMaximized: boolean;
  isFullScreen: boolean;
}

// App configuration
export interface AppConfig {
  version: string;
  name: string;
  isPackaged: boolean;
  isDevelopment: boolean;
}

// YOLO Mode types (for future implementation)
export interface TrustSettings {
  enabled: boolean;
  domains: string[];
  actions: string[];
  expires?: Date;
}

export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  target: string;
  result: 'success' | 'failure' | 'blocked';
  metadata?: Record<string, any>;
}

// Monaco Editor types
export interface EditorTheme {
  name: string;
  base: 'vs' | 'vs-dark' | 'hc-black';
  inherit: boolean;
  rules: any[];
  colors: Record<string, string>;
}

export interface EditorConfig {
  theme: string;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  minimap: {
    enabled: boolean;
  };
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';
}
