/**
 * Monaco Editor Service
 * 
 * High-level abstraction over Monaco Editor initialization and management.
 * Uses PlatformAdapter to handle platform-specific loading strategies.
 * 
 * This service provides:
 * - Platform-agnostic Monaco initialization
 * - Automatic fallback strategies
 * - Error recovery and reporting
 * - Performance monitoring
 * - Feature toggles based on platform capabilities
 */

import * as monaco from 'monaco-editor';
import { 
  detectPlatform, 
  getPlatformConfig, 
  createWorkerConfig, 
  validatePlatformSupport,
  getEnvironmentConfig,
  MonacoPlatformConfig,
  Platform 
} from './PlatformAdapter';

export interface MonacoServiceConfig {
  platform?: Platform;
  fallbackStrategy?: 'cdn' | 'minimal' | 'none';
  enableTelemetry?: boolean;
  customThemes?: monaco.editor.IStandaloneThemeData[];
}

export interface MonacoInitResult {
  success: boolean;
  platform: Platform;
  strategy: string;
  featuresAvailable: string[];
  languagesLoaded: string[];
  warnings: string[];
  errors: string[];
  initTime: number;
}

export class MonacoEditorService {
  private static instance: MonacoEditorService;
  private initialized = false;
  private config: MonacoPlatformConfig | undefined;
  private initResult?: MonacoInitResult;

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): MonacoEditorService {
    if (!MonacoEditorService.instance) {
      MonacoEditorService.instance = new MonacoEditorService();
    }
    return MonacoEditorService.instance;
  }

  /**
   * Initialize Monaco Editor with platform-specific configuration
   */
  public async initialize(userConfig?: MonacoServiceConfig): Promise<MonacoInitResult> {
    const startTime = performance.now();
    
    try {
      // Detect platform and get base config
      const platform = userConfig?.platform || detectPlatform();
      this.config = {
        ...getPlatformConfig(platform),
        ...getEnvironmentConfig()
      };

      // Validate platform support
      const validation = validatePlatformSupport(this.config);
      if (!validation.supported) {
        throw new Error(`Platform not supported: ${validation.errors.join(', ')}`);
      }

      // Configure Monaco environment
      await this.configureMonacoEnvironment();

      // Initialize themes
      if (userConfig?.customThemes) {
        userConfig.customThemes.forEach(theme => {
          monaco.editor.defineTheme(theme.base, theme);
        });
      }

      const endTime = performance.now();
      
      this.initResult = {
        success: true,
        platform,
        strategy: this.config.strategy,
        featuresAvailable: this.config.features,
        languagesLoaded: this.config.languages,
        warnings: validation.warnings,
        errors: [],
        initTime: endTime - startTime
      };

      this.initialized = true;

      // Log telemetry if enabled
      if (userConfig?.enableTelemetry) {
        this.logTelemetry('monaco_init_success', this.initResult);
      }

      return this.initResult;

    } catch (error) {
      const endTime = performance.now();
      
      this.initResult = {
        success: false,
        platform: userConfig?.platform || detectPlatform(),
        strategy: this.config?.strategy || 'unknown',
        featuresAvailable: [],
        languagesLoaded: [],
        warnings: [],
        errors: [error instanceof Error ? error.message : String(error)],
        initTime: endTime - startTime
      };

      // Attempt fallback if configured
      if (userConfig?.fallbackStrategy && userConfig.fallbackStrategy !== 'none') {
        return this.attemptFallback(userConfig.fallbackStrategy);
      }

      return this.initResult;
    }
  }

  /**
   * Configure Monaco environment based on platform
   */
  private async configureMonacoEnvironment(): Promise<void> {
    if (!this.config) {
      throw new Error('Monaco configuration not initialized');
    }

    const workerConfig = createWorkerConfig(this.config);

    // Set up Monaco environment
    (window as any).MonacoEnvironment = {
      ...workerConfig,
      getWorkerUrl: workerConfig.getWorkerUrl,
      getWorker: workerConfig.getWorker
    };

    // Platform-specific initialization
    switch (this.config.platform) {
      case 'electron':
        await this.configureElectronSpecific();
        break;
      case 'web':
        await this.configureWebSpecific();
        break;
      case 'mobile':
        await this.configureMobileSpecific();
        break;
    }
  }

  /**
   * Electron-specific configuration
   */
  private async configureElectronSpecific(): Promise<void> {
    // Electron-specific optimizations are applied during editor creation
    // via getPlatformOptimizedOptions()
  }

  /**
   * Web-specific configuration
   */
  private async configureWebSpecific(): Promise<void> {
    // Lazy load language features for web
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"]
    });
  }

  /**
   * Mobile-specific configuration
   */
  private async configureMobileSpecific(): Promise<void> {
    // Mobile-specific optimizations are applied during editor creation
    // via getPlatformOptimizedOptions()
  }

  /**
   * Attempt fallback initialization strategy
   */
  private async attemptFallback(strategy: 'cdn' | 'minimal'): Promise<MonacoInitResult> {
    try {
      console.warn('Monaco initialization failed, attempting fallback:', strategy);

      if (strategy === 'minimal') {
        // Minimal configuration - basic editor only
        this.config = {
          platform: detectPlatform(),
          strategy: 'bundled',
          features: ['core'],
          languages: ['javascript', 'typescript', 'html', 'css', 'json']
        };
      } else if (strategy === 'cdn') {
        // CDN fallback
        this.config = {
          platform: 'web',
          strategy: 'cdn',
          baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs',
          features: ['core', 'languages'],
          languages: ['javascript', 'typescript', 'html', 'css', 'json']
        };
      }

      await this.configureMonacoEnvironment();
      
      return {
        success: true,
        platform: this.config?.platform || detectPlatform(),
        strategy: `fallback-${strategy}`,
        featuresAvailable: this.config?.features || [],
        languagesLoaded: this.config?.languages || [],
        warnings: ['Fallback strategy used due to initialization failure'],
        errors: [],
        initTime: 0
      };

    } catch (fallbackError) {
      return {
        success: false,
        platform: detectPlatform(),
        strategy: 'fallback-failed',
        featuresAvailable: [],
        languagesLoaded: [],
        warnings: [],
        errors: [
          ...(this.initResult?.errors || []),
          `Fallback failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
        ],
        initTime: 0
      };
    }
  }

  /**
   * Create Monaco editor instance with platform-optimized settings
   */
  public createEditor(
    container: HTMLElement, 
    options: monaco.editor.IStandaloneEditorConstructionOptions = {}
  ): monaco.editor.IStandaloneCodeEditor {
    if (!this.initialized) {
      throw new Error('Monaco service not initialized. Call initialize() first.');
    }

    const platformOptimizedOptions = this.getPlatformOptimizedOptions(options);
    return monaco.editor.create(container, platformOptimizedOptions);
  }

  /**
   * Get platform-optimized editor options
   */
  private getPlatformOptimizedOptions(
    userOptions: monaco.editor.IStandaloneEditorConstructionOptions
  ): monaco.editor.IStandaloneEditorConstructionOptions {
    const baseOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
      theme: 'vs-dark',
      automaticLayout: true,
      ...userOptions
    };

    if (!this.config) {
      return baseOptions;
    }

    // Platform-specific optimizations
    switch (this.config.platform) {
      case 'mobile':
        return {
          ...baseOptions,
          fontSize: 16,
          lineHeight: 24,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on'
        };
      case 'web':
        return {
          ...baseOptions,
          minimap: { enabled: this.config.features.includes('full') },
          codeLens: this.config.features.includes('full')
        };
      case 'electron':
        return {
          ...baseOptions,
          fontSize: 14,
          fontFamily: "'Cascadia Code', 'Fira Code', 'Monaco', 'Menlo', monospace",
          minimap: { enabled: true, maxColumn: 120 }
        };
      default:
        return baseOptions;
    }
  }

  /**
   * Get current initialization result
   */
  public getInitResult(): MonacoInitResult | undefined {
    return this.initResult;
  }

  /**
   * Check if Monaco is ready
   */
  public isReady(): boolean {
    return this.initialized && this.initResult?.success === true;
  }

  /**
   * Log telemetry data
   */
  private logTelemetry(event: string, data: any): void {
    // In production, this would send to your analytics service
    console.info(`[Monaco Telemetry] ${event}:`, data);
    
    // Example: Send to analytics service
    // analytics.track(event, data);
  }

  /**
   * Dispose of Monaco resources
   */
  public dispose(): void {
    this.initialized = false;
    this.initResult = undefined;
    // Clean up any Monaco resources if needed
  }
}
