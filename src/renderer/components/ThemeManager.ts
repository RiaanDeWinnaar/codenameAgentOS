import * as monaco from 'monaco-editor';

export type MonacoTheme = 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light' | 'yolo-dark' | 'yolo-light';

export interface ThemeManager {
  currentTheme: MonacoTheme;
  setTheme: (theme: MonacoTheme) => void;
  registerCustomThemes: () => void;
  toggleTheme: () => void;
  getAvailableThemes: () => MonacoTheme[];
}

/**
 * Enhanced Monaco Theme Manager for YOLO-Browser
 * Provides custom dark/light themes and theme switching functionality
 */
export class MonacoThemeManager implements ThemeManager {
  public currentTheme: MonacoTheme = 'yolo-dark';
  private editor?: monaco.editor.IStandaloneCodeEditor;

  constructor(editor?: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.registerCustomThemes();
    this.loadSavedTheme();
  }

  public setEditor(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
  }

  public setTheme(theme: MonacoTheme): void {
    this.currentTheme = theme;
    monaco.editor.setTheme(theme);
    this.saveTheme(theme);
    
    // Update editor if available
    if (this.editor) {
      this.editor.updateOptions({ theme });
    }
    
    console.log(`Theme switched to: ${theme}`);
  }

  public toggleTheme(): void {
    const isDark = this.currentTheme.includes('dark');
    const newTheme: MonacoTheme = isDark ? 'yolo-light' : 'yolo-dark';
    this.setTheme(newTheme);
  }

  public getAvailableThemes(): MonacoTheme[] {
    return ['vs-dark', 'vs-light', 'hc-black', 'hc-light', 'yolo-dark', 'yolo-light'];
  }

  public registerCustomThemes(): void {
    // Register YOLO Dark Theme
    monaco.editor.defineTheme('yolo-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Background and foreground
        { token: '', foreground: 'D4D4D4', background: '1E1E1E' },
        
        // Comments
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'comment.block', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'comment.line', foreground: '6A9955', fontStyle: 'italic' },
        
        // Keywords
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'keyword.operator', foreground: 'D4D4D4' },
        
        // Strings
        { token: 'string', foreground: 'CE9178' },
        { token: 'string.escape', foreground: 'D7BA7D' },
        
        // Numbers
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'number.hex', foreground: 'B5CEA8' },
        
        // Functions and methods
        { token: 'identifier.function', foreground: 'DCDCAA' },
        { token: 'support.function', foreground: 'DCDCAA' },
        
        // Types and classes
        { token: 'entity.name.type', foreground: '4EC9B0' },
        { token: 'entity.name.class', foreground: '4EC9B0' },
        { token: 'support.type', foreground: '4EC9B0' },
        
        // Variables
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'variable.parameter', foreground: '9CDCFE' },
        
        // Constants
        { token: 'constant', foreground: '4FC1FF' },
        { token: 'constant.language', foreground: '569CD6' },
        
        // HTML/XML
        { token: 'tag', foreground: '569CD6' },
        { token: 'tag.attribute.name', foreground: '92C5F8' },
        { token: 'tag.attribute.value', foreground: 'CE9178' },
        
        // CSS
        { token: 'attribute.name.css', foreground: '92C5F8' },
        { token: 'attribute.value.css', foreground: 'CE9178' },
        { token: 'property.css', foreground: '9CDCFE' },
        
        // JSON
        { token: 'key.json', foreground: '9CDCFE' },
        { token: 'value.json', foreground: 'CE9178' },
        
        // Markdown
        { token: 'markdown.heading', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'markdown.bold', fontStyle: 'bold' },
        { token: 'markdown.italic', fontStyle: 'italic' },
        
        // Error highlighting
        { token: 'invalid', foreground: 'F44747', background: '663333' },
        { token: 'invalid.deprecated', foreground: 'F44747', fontStyle: 'underline' },
      ],
      colors: {
        // Editor background
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        
        // Line numbers and margins
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editor.lineHighlightBackground': '#2A2D2E',
        'editor.lineHighlightBorder': '#00000000',
        
        // Selection
        'editor.selectionBackground': '#264F78',
        'editor.selectionHighlightBackground': '#ADD6FF26',
        'editor.inactiveSelectionBackground': '#3A3D41',
        
        // Search
        'editor.findMatchBackground': '#515C6A',
        'editor.findMatchHighlightBackground': '#EA5C0055',
        'editor.findRangeHighlightBackground': '#3A3D4166',
        
        // Gutter
        'editorGutter.background': '#1E1E1E',
        'editorGutter.modifiedBackground': '#E2C08D',
        'editorGutter.addedBackground': '#587C0C',
        'editorGutter.deletedBackground': '#94151B',
        
        // Cursor
        'editorCursor.foreground': '#AEAFAD',
        
        // Scrollbar
        'scrollbarSlider.background': '#79797966',
        'scrollbarSlider.hoverBackground': '#646464B3',
        'scrollbarSlider.activeBackground': '#BFBFBF66',
        
        // Minimap
        'minimap.background': '#1E1E1E',
        'minimap.selectionHighlight': '#264F78',
        'minimap.errorHighlight': '#F44747',
        'minimap.warningHighlight': '#FF8C00',
        
        // Bracket matching
        'editorBracketMatch.background': '#0064001A',
        'editorBracketMatch.border': '#888888',
        
        // Code folding
        'editorCodeLens.foreground': '#999999',
        
        // Diff editor
        'diffEditor.insertedTextBackground': '#9bb95533',
        'diffEditor.removedTextBackground': '#ff000033',
        
        // Suggest widget
        'editorSuggestWidget.background': '#252526',
        'editorSuggestWidget.border': '#454545',
        'editorSuggestWidget.foreground': '#D4D4D4',
        'editorSuggestWidget.selectedBackground': '#094771',
        
        // Hover widget
        'editorHoverWidget.background': '#252526',
        'editorHoverWidget.border': '#454545',
      }
    });

    // Register YOLO Light Theme
    monaco.editor.defineTheme('yolo-light', {
      base: 'vs',
      inherit: true,
      rules: [
        // Background and foreground
        { token: '', foreground: '000000', background: 'FFFFFF' },
        
        // Comments
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'comment.block', foreground: '008000', fontStyle: 'italic' },
        { token: 'comment.line', foreground: '008000', fontStyle: 'italic' },
        
        // Keywords
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'AF00DB', fontStyle: 'bold' },
        { token: 'keyword.operator', foreground: '000000' },
        
        // Strings
        { token: 'string', foreground: 'A31515' },
        { token: 'string.escape', foreground: 'FF0000' },
        
        // Numbers
        { token: 'number', foreground: '098658' },
        { token: 'number.hex', foreground: '098658' },
        
        // Functions and methods
        { token: 'identifier.function', foreground: '795E26' },
        { token: 'support.function', foreground: '795E26' },
        
        // Types and classes
        { token: 'entity.name.type', foreground: '267F99' },
        { token: 'entity.name.class', foreground: '267F99' },
        { token: 'support.type', foreground: '267F99' },
        
        // Variables
        { token: 'variable', foreground: '001080' },
        { token: 'variable.parameter', foreground: '001080' },
        
        // Constants
        { token: 'constant', foreground: '0000FF' },
        { token: 'constant.language', foreground: '0000FF' },
        
        // HTML/XML
        { token: 'tag', foreground: '800000' },
        { token: 'tag.attribute.name', foreground: 'FF0000' },
        { token: 'tag.attribute.value', foreground: '0000FF' },
        
        // CSS
        { token: 'attribute.name.css', foreground: 'FF0000' },
        { token: 'attribute.value.css', foreground: '0000FF' },
        { token: 'property.css', foreground: 'FF0000' },
        
        // JSON
        { token: 'key.json', foreground: '0451A5' },
        { token: 'value.json', foreground: 'A31515' },
        
        // Markdown
        { token: 'markdown.heading', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'markdown.bold', fontStyle: 'bold' },
        { token: 'markdown.italic', fontStyle: 'italic' },
        
        // Error highlighting
        { token: 'invalid', foreground: 'CD3131', background: 'FFCCCC' },
        { token: 'invalid.deprecated', foreground: 'CD3131', fontStyle: 'underline' },
      ],
      colors: {
        // Editor background
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        
        // Line numbers and margins
        'editorLineNumber.foreground': '#237893',
        'editorLineNumber.activeForeground': '#0B216F',
        'editor.lineHighlightBackground': '#F7F7F7',
        'editor.lineHighlightBorder': '#00000000',
        
        // Selection
        'editor.selectionBackground': '#ADD6FF',
        'editor.selectionHighlightBackground': '#ADD6FF80',
        'editor.inactiveSelectionBackground': '#E5EBF1',
        
        // Search
        'editor.findMatchBackground': '#A8AC94',
        'editor.findMatchHighlightBackground': '#EA5C0055',
        'editor.findRangeHighlightBackground': '#B4B4B44D',
        
        // Gutter
        'editorGutter.background': '#FFFFFF',
        'editorGutter.modifiedBackground': '#1B81A8',
        'editorGutter.addedBackground': '#487E02',
        'editorGutter.deletedBackground': '#AD0707',
        
        // Cursor
        'editorCursor.foreground': '#000000',
        
        // Scrollbar
        'scrollbarSlider.background': '#64646466',
        'scrollbarSlider.hoverBackground': '#646464B3',
        'scrollbarSlider.activeBackground': '#00000066',
        
        // Minimap
        'minimap.background': '#FFFFFF',
        'minimap.selectionHighlight': '#ADD6FF',
        'minimap.errorHighlight': '#E51400',
        'minimap.warningHighlight': '#BF8803',
        
        // Bracket matching
        'editorBracketMatch.background': '#0064001A',
        'editorBracketMatch.border': '#B9B9B9',
        
        // Code folding
        'editorCodeLens.foreground': '#919191',
        
        // Diff editor
        'diffEditor.insertedTextBackground': '#9bb95533',
        'diffEditor.removedTextBackground': '#ff000033',
        
        // Suggest widget
        'editorSuggestWidget.background': '#F3F3F3',
        'editorSuggestWidget.border': '#C8C8C8',
        'editorSuggestWidget.foreground': '#000000',
        'editorSuggestWidget.selectedBackground': '#007ACC',
        
        // Hover widget
        'editorHoverWidget.background': '#F3F3F3',
        'editorHoverWidget.border': '#C8C8C8',
      }
    });

    console.log('Custom YOLO themes registered');
  }

  private loadSavedTheme(): void {
    try {
      const savedTheme = localStorage.getItem('yolo-monaco-theme') as MonacoTheme;
      if (savedTheme && this.getAvailableThemes().includes(savedTheme)) {
        this.setTheme(savedTheme);
      } else {
        this.setTheme('yolo-dark'); // Default theme
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error);
      this.setTheme('yolo-dark');
    }
  }

  private saveTheme(theme: MonacoTheme): void {
    try {
      localStorage.setItem('yolo-monaco-theme', theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  // Utility methods for external use
  public isDarkTheme(): boolean {
    return this.currentTheme.includes('dark') || this.currentTheme === 'hc-black';
  }

  public isLightTheme(): boolean {
    return this.currentTheme.includes('light') || this.currentTheme === 'vs-light';
  }

  public getThemeInfo() {
    return {
      current: this.currentTheme,
      isDark: this.isDarkTheme(),
      isLight: this.isLightTheme(),
      available: this.getAvailableThemes()
    };
  }
}
