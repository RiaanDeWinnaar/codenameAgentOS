import * as monaco from 'monaco-editor';

// Configure Monaco Editor for Electron environment
export function configureMonacoEnvironment() {
  // Set the worker environment for Electron
  if (typeof window !== 'undefined') {
    (self as any).MonacoEnvironment = {
      getWorkerUrl: function (moduleId: string, label: string) {
        switch (label) {
          case 'json':
            return './json.worker.js';
          case 'css':
          case 'scss':
          case 'less':
            return './css.worker.js';
          case 'html':
          case 'handlebars':
          case 'razor':
            return './html.worker.js';
          case 'typescript':
          case 'javascript':
            return './ts.worker.js';
          default:
            return './editor.worker.js';
        }
      }
    };
  }
}

// Initialize Monaco languages and features
export function initializeMonacoLanguages() {
  // Configure TypeScript compiler options
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types'],
    strict: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true,
    declaration: false,
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
  });

  // Configure diagnostics for better error reporting
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false,
  });

  // Add common type definitions
  monaco.languages.typescript.typescriptDefaults.addExtraLib(`
    declare module "*.css" {
      const content: { [className: string]: string };
      export default content;
    }
    declare module "*.json" {
      const value: any;
      export default value;
    }
    declare module "*.svg" {
      const content: string;
      export default content;
    }
    declare module "*.png" {
      const content: string;
      export default content;
    }
    declare module "*.jpg" {
      const content: string;
      export default content;
    }
    // React types
    declare namespace React {
      interface Component<P = {}, S = {}> {}
      interface FunctionComponent<P = {}> {}
      type FC<P = {}> = FunctionComponent<P>;
    }
  `, 'file:///node_modules/@types/assets.d.ts');

  // Configure HTML language
  monaco.languages.html.htmlDefaults.setOptions({
    format: {
      tabSize: 2,
      insertSpaces: true,
      wrapLineLength: 120,
      unformatted: 'default',
      contentUnformatted: 'pre,code,textarea',
      indentInnerHtml: false,
      preserveNewLines: true,
      maxPreserveNewLines: undefined,
      indentHandlebars: false,
      endWithNewline: false,
      extraLiners: 'head, body, /html',
      wrapAttributes: 'auto'
    },
    suggest: { html5: true },
  });

  // Configure CSS language
  monaco.languages.css.cssDefaults.setOptions({
    lint: {
      compatibleVendorPrefixes: 'warning',
      vendorPrefix: 'warning',
      duplicateProperties: 'warning',
      emptyRules: 'warning',
      importStatement: 'ignore',
      boxModel: 'ignore',
      universalSelector: 'ignore',
      zeroUnits: 'ignore',
      fontFaceProperties: 'warning',
      hexColorLength: 'error',
      argumentsInColorFunction: 'error',
      unknownProperties: 'warning',
      ieHack: 'ignore',
      unknownVendorSpecificProperties: 'ignore',
      propertyIgnoredDueToDisplay: 'warning',
      important: 'ignore',
      float: 'ignore',
      idSelector: 'ignore'
    },
    validate: true
  });

  console.log('Monaco languages configured successfully');
}
