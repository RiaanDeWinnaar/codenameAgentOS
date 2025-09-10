/**
 * Shared constants used across the application
 */

import { IPCChannels } from './types';

// IPC channel names
export const IPC_CHANNELS: IPCChannels = {
  APP_GET_VERSION: 'app:getVersion',
  APP_GET_NAME: 'app:getName',
  APP_IS_PACKAGED: 'app:isPackaged',

  DIALOG_OPEN_FILE: 'dialog:openFile',
  DIALOG_OPEN_DIRECTORY: 'dialog:openDirectory',

  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',

  LOG_INFO: 'log:info',
  LOG_ERROR: 'log:error',
};

// Application metadata
export const APP_METADATA = {
  NAME: 'YOLO-Browser',
  DESCRIPTION: 'Autonomous Web Automation Platform',
  VERSION: '1.0.0',
  AUTHOR: 'YOLO-Browser Team',
  WEBSITE: 'https://github.com/RiaanDeWinnaar/codenameAgentOS',
} as const;

// Window configuration
export const WINDOW_CONFIG = {
  DEFAULT_WIDTH: 1400,
  DEFAULT_HEIGHT: 900,
  MIN_WIDTH: 1200,
  MIN_HEIGHT: 700,
} as const;

// Development configuration
export const DEV_CONFIG = {
  RENDERER_PORT: 3000,
  RENDERER_URL: 'http://localhost:3000',
  HOT_RELOAD: true,
  OPEN_DEVTOOLS: true,
} as const;

// File extensions and filters
export const FILE_FILTERS = [
  { name: 'All Files', extensions: ['*'] },
  { name: 'JavaScript', extensions: ['js', 'jsx'] },
  { name: 'TypeScript', extensions: ['ts', 'tsx'] },
  { name: 'HTML', extensions: ['html', 'htm'] },
  { name: 'CSS', extensions: ['css', 'scss', 'sass'] },
  { name: 'JSON', extensions: ['json'] },
  { name: 'Markdown', extensions: ['md', 'markdown'] },
] as const;

// Security configuration
export const SECURITY_CONFIG = {
  CSP: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss: http://localhost:* https://*",
  ALLOWED_PERMISSIONS: ['clipboard-read', 'clipboard-write'],
  ALLOWED_PROTOCOLS: ['http:', 'https:', 'file:'],
} as const;

// Monaco Editor defaults
export const EDITOR_DEFAULTS = {
  THEME: 'vs-dark',
  FONT_SIZE: 14,
  FONT_FAMILY: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
  TAB_SIZE: 2,
  INSERT_SPACES: true,
  WORD_WRAP: 'on' as const,
  MINIMAP_ENABLED: true,
  LINE_NUMBERS: 'on' as const,
} as const;

// Browser automation defaults
export const AUTOMATION_CONFIG = {
  DEFAULT_TIMEOUT: 30000,
  SELECTOR_TIMEOUT: 5000,
  NAVIGATION_TIMEOUT: 30000,
  SCREENSHOT_QUALITY: 90,
} as const;

// YOLO Mode configuration
export const YOLO_CONFIG = {
  DEFAULT_TRUST_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MAX_AUDIT_LOG_ENTRIES: 10000,
  TRUST_BACKUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;
