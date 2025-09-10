/**
 * Platform Adapter for Monaco Editor
 * 
 * Abstracts platform-specific Monaco loading strategies
 * Supports: Electron, Web, Mobile (future)
 * 
 * This abstraction prevents vendor lock-in to our current Electron-specific approach
 * and enables future deployment to web, mobile, or other platforms.
 */

export type Platform = 'electron' | 'web' | 'mobile';
export type LoadingStrategy = 'bundled' | 'cdn' | 'hybrid';

export interface MonacoPlatformConfig {
  platform: Platform;
  strategy: LoadingStrategy;
  baseUrl?: string;
  workerUrl?: string;
  features: string[];
  languages: string[];
  maxBundleSize?: number; // MB
}

export interface WorkerConfig {
  getWorker?: (workerId: string, label: string) => Worker;
  getWorkerUrl?: (workerId: string, label: string) => string;
}

/**
 * Platform-specific configurations
 */
const PLATFORM_CONFIGS: Record<Platform, MonacoPlatformConfig> = {
  electron: {
    platform: 'electron',
    strategy: 'bundled',
    features: ['full'], // All features available
    languages: [
      'typescript', 'javascript', 'html', 'css', 'scss', 'json', 'xml',
      'yaml', 'markdown', 'python', 'java', 'csharp', 'cpp', 'c',
      'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'dart',
      'sql', 'shell', 'dockerfile', 'powershell', 'bat', 'r', 'julia'
    ]
  },
  web: {
    platform: 'web',
    strategy: 'hybrid', // CDN + local critical path
    baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs',
    features: ['core', 'languages', 'suggest'], // Reduced for performance
    languages: ['typescript', 'javascript', 'html', 'css', 'json', 'markdown'],
    maxBundleSize: 5 // Max 5MB for web
  },
  mobile: {
    platform: 'mobile',
    strategy: 'bundled',
    features: ['core'], // Minimal features
    languages: ['javascript', 'html', 'css', 'json'], // Essential only
    maxBundleSize: 2 // Max 2MB for mobile
  }
};

/**
 * Detects current platform
 */
export function detectPlatform(): Platform {
  // Electron detection
  if (typeof window !== 'undefined' && window.electronAPI) {
    return 'electron';
  }
  
  // Mobile detection
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent;
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
  }
  
  // Default to web
  return 'web';
}

/**
 * Gets platform-specific configuration
 */
export function getPlatformConfig(platform?: Platform): MonacoPlatformConfig {
  const currentPlatform = platform || detectPlatform();
  return PLATFORM_CONFIGS[currentPlatform];
}

/**
 * Creates platform-specific worker configuration
 */
export function createWorkerConfig(config: MonacoPlatformConfig): WorkerConfig {
  switch (config.strategy) {
    case 'bundled':
      return {
        getWorker: (workerId: string, label: string) => {
          // Electron/bundled strategy - direct worker instantiation
          const workerMap: Record<string, string> = {
            'typescript': './ts.worker.js',
            'javascript': './ts.worker.js',
            'html': './html.worker.js',
            'css': './css.worker.js',
            'json': './json.worker.js',
            'default': './editor.worker.js'
          };
          
          const workerPath = workerMap[label] || workerMap.default;
          return new Worker(workerPath);
        }
      };
      
    case 'cdn':
      return {
        getWorkerUrl: (workerId: string, label: string) => {
          // Web/CDN strategy - URL-based loading
          const baseUrl = config.baseUrl || 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs';
          const workerMap: Record<string, string> = {
            'typescript': `${baseUrl}/language/typescript/ts.worker.js`,
            'javascript': `${baseUrl}/language/typescript/ts.worker.js`,
            'html': `${baseUrl}/language/html/html.worker.js`,
            'css': `${baseUrl}/language/css/css.worker.js`,
            'json': `${baseUrl}/language/json/json.worker.js`,
            'default': `${baseUrl}/editor/editor.worker.js`
          };
          
          return workerMap[label] || workerMap.default;
        }
      };
      
    case 'hybrid':
      return {
        getWorker: (workerId: string, label: string) => {
          // Hybrid strategy - try bundled first, fallback to CDN
          try {
            const workerMap: Record<string, string> = {
              'typescript': './ts.worker.js',
              'javascript': './ts.worker.js',
              'html': './html.worker.js',
              'css': './css.worker.js',
              'json': './json.worker.js',
              'default': './editor.worker.js'
            };
            
            const workerPath = workerMap[label] || workerMap.default;
            return new Worker(workerPath);
          } catch (error) {
            // Fallback to CDN
            console.warn('Bundled worker failed, falling back to CDN:', error);
            const baseUrl = config.baseUrl || 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs';
            const workerMap: Record<string, string> = {
              'typescript': `${baseUrl}/language/typescript/ts.worker.js`,
              'javascript': `${baseUrl}/language/typescript/ts.worker.js`,
              'html': `${baseUrl}/language/html/html.worker.js`,
              'css': `${baseUrl}/language/css/css.worker.js`,
              'json': `${baseUrl}/language/json/json.worker.js`,
              'default': `${baseUrl}/editor/editor.worker.js`
            };
            
            const workerUrl = workerMap[label] || workerMap.default;
            return new Worker(workerUrl);
          }
        }
      };
      
    default:
      throw new Error(`Unsupported loading strategy: ${config.strategy}`);
  }
}

/**
 * Validates platform capabilities
 */
export function validatePlatformSupport(config: MonacoPlatformConfig): {
  supported: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check Worker support
  if (typeof Worker === 'undefined') {
    errors.push('Web Workers not supported on this platform');
  }
  
  // Check bundle size constraints
  if (config.maxBundleSize && config.languages.length > 10) {
    warnings.push(`Large language set (${config.languages.length}) may exceed bundle size limit (${config.maxBundleSize}MB)`);
  }
  
  // Mobile-specific checks
  if (config.platform === 'mobile') {
    if (config.features.includes('full')) {
      warnings.push('Full feature set may cause performance issues on mobile');
    }
  }
  
  return {
    supported: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Environment-based configuration override
 */
export function getEnvironmentConfig(): Partial<MonacoPlatformConfig> {
  const overrides: Partial<MonacoPlatformConfig> = {};
  
  // Environment variable overrides
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.MONACO_STRATEGY) {
      overrides.strategy = process.env.MONACO_STRATEGY as LoadingStrategy;
    }
    
    if (process.env.MONACO_BASE_URL) {
      overrides.baseUrl = process.env.MONACO_BASE_URL;
    }
    
    if (process.env.MONACO_MAX_BUNDLE_SIZE) {
      overrides.maxBundleSize = parseInt(process.env.MONACO_MAX_BUNDLE_SIZE, 10);
    }
  }
  
  return overrides;
}
