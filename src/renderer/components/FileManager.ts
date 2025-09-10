/**
 * File Management System for YOLO-Browser Monaco Editor
 * Handles file operations, workspace management, and tab functionality
 */

export interface FileTabInfo {
  id: string;
  filename: string;
  filepath?: string;
  content: string;
  isDirty: boolean;
  language: string;
  isActive: boolean;
}

export interface WorkspaceFile {
  path: string;
  name: string;
  content: string;
  language: string;
  lastModified: Date;
}

export interface FileOperations {
  // Core file operations
  newFile: (filename?: string, content?: string) => FileTabInfo;
  openFile: (filepath: string) => Promise<FileTabInfo>;
  saveFile: (tabId: string, filepath?: string) => Promise<boolean>;
  saveAsFile: (tabId: string) => Promise<string | null>;
  closeFile: (tabId: string) => boolean;
  
  // Tab management
  switchToTab: (tabId: string) => void;
  getActiveTab: () => FileTabInfo | null;
  getAllTabs: () => FileTabInfo[];
  getTabById: (tabId: string) => FileTabInfo | null;
  
  // Content management
  updateTabContent: (tabId: string, content: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  
  // Workspace operations
  getWorkspaceFiles: () => Promise<WorkspaceFile[]>;
  refreshWorkspace: () => Promise<void>;
}

export class MonacoFileManager implements FileOperations {
  private readonly tabs: Map<string, FileTabInfo> = new Map();
  private activeTabId: string | null = null;
  private nextTabId: number = 1;
  private readonly onTabChange?: (tab: FileTabInfo | null) => void;
  private readonly onTabsUpdate?: (tabs: FileTabInfo[]) => void;

  constructor(
    onTabChange?: (tab: FileTabInfo | null) => void,
    onTabsUpdate?: (tabs: FileTabInfo[]) => void
  ) {
    this.onTabChange = onTabChange;
    this.onTabsUpdate = onTabsUpdate;
    
    // Create initial welcome tab
    this.createWelcomeTab();
  }

  public newFile(filename?: string, content?: string): FileTabInfo {
    const id = `tab-${this.nextTabId++}`;
    const defaultFilename = filename || `Untitled-${this.nextTabId - 1}`;
    const defaultContent = content || this.getDefaultContent(defaultFilename);
    const language = this.detectLanguage(defaultFilename);

    const tab: FileTabInfo = {
      id,
      filename: defaultFilename,
      content: defaultContent,
      isDirty: false,
      language,
      isActive: false
    };

    this.tabs.set(id, tab);
    this.switchToTab(id);
    this.notifyTabsUpdate();

    console.log(`Created new file: ${defaultFilename}`);
    return tab;
  }

  public async openFile(filepath: string): Promise<FileTabInfo> {
    try {
      // Check if file is already open
      const existingTab = Array.from(this.tabs.values()).find(
        tab => tab.filepath === filepath
      );
      
      if (existingTab) {
        this.switchToTab(existingTab.id);
        return existingTab;
      }

      // Read file content (simulated for now - in real implementation would use Electron APIs)
      const content = await this.readFileContent(filepath);
      const filename = this.extractFilename(filepath);
      const language = this.detectLanguage(filename);
      
      const id = `tab-${this.nextTabId++}`;
      const tab: FileTabInfo = {
        id,
        filename,
        filepath,
        content,
        isDirty: false,
        language,
        isActive: false
      };

      this.tabs.set(id, tab);
      this.switchToTab(id);
      this.notifyTabsUpdate();

      console.log(`Opened file: ${filepath}`);
      return tab;
    } catch (error) {
      console.error('Failed to open file:', error);
      throw new Error(`Failed to open file: ${filepath}`);
    }
  }

  public async saveFile(tabId: string, filepath?: string): Promise<boolean> {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      console.error(`Tab not found: ${tabId}`);
      return false;
    }

    try {
      const saveFilepath = filepath || tab.filepath;
      
      if (!saveFilepath) {
        // No filepath provided and tab doesn't have one - trigger save as
        const newFilepath = await this.saveAsFile(tabId);
        return newFilepath !== null;
      }

      // Save file content (simulated for now - in real implementation would use Electron APIs)
      await this.writeFileContent(saveFilepath, tab.content);
      
      // Update tab
      tab.filepath = saveFilepath;
      tab.filename = this.extractFilename(saveFilepath);
      tab.isDirty = false;
      
      this.notifyTabsUpdate();
      console.log(`Saved file: ${saveFilepath}`);
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  }

  public async saveAsFile(tabId: string): Promise<string | null> {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      console.error(`Tab not found: ${tabId}`);
      return null;
    }

    try {
      // Show save dialog (simulated for now - in real implementation would use Electron APIs)
      const filepath = await this.showSaveDialog(tab.filename);
      
      if (!filepath) {
        return null; // User cancelled
      }

      const success = await this.saveFile(tabId, filepath);
      return success ? filepath : null;
    } catch (error) {
      console.error('Failed to save file as:', error);
      return null;
    }
  }

  public closeFile(tabId: string): boolean {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      return false;
    }

    // Check if file has unsaved changes
    if (tab.isDirty) {
      const shouldSave = this.confirmUnsavedChanges(tab.filename);
      if (shouldSave === null) {
        return false; // User cancelled
      }
      if (shouldSave) {
        // Auto-save (simplified implementation)
        this.saveFile(tabId);
      }
    }

    this.tabs.delete(tabId);

    // If this was the active tab, switch to another tab
    if (this.activeTabId === tabId) {
      const remainingTabs = Array.from(this.tabs.values());
      if (remainingTabs.length > 0) {
        this.switchToTab(remainingTabs[remainingTabs.length - 1].id);
      } else {
        this.activeTabId = null;
        this.createWelcomeTab();
      }
    }

    this.notifyTabsUpdate();
    console.log(`Closed file: ${tab.filename}`);
    return true;
  }

  public switchToTab(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      console.error(`Tab not found: ${tabId}`);
      return;
    }

    // Deactivate current tab
    if (this.activeTabId) {
      const currentTab = this.tabs.get(this.activeTabId);
      if (currentTab) {
        currentTab.isActive = false;
      }
    }

    // Activate new tab
    tab.isActive = true;
    this.activeTabId = tabId;
    
    this.onTabChange?.(tab);
    this.notifyTabsUpdate();
    console.log(`Switched to tab: ${tab.filename}`);
  }

  public getActiveTab(): FileTabInfo | null {
    return this.activeTabId ? this.tabs.get(this.activeTabId) || null : null;
  }

  public getAllTabs(): FileTabInfo[] {
    return Array.from(this.tabs.values());
  }

  public getTabById(tabId: string): FileTabInfo | null {
    return this.tabs.get(tabId) || null;
  }

  public updateTabContent(tabId: string, content: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      console.error(`Tab not found: ${tabId}`);
      return;
    }

    const wasChanged = tab.content !== content;
    tab.content = content;
    
    if (wasChanged && !tab.isDirty) {
      this.markTabDirty(tabId, true);
    }
  }

  public markTabDirty(tabId: string, isDirty: boolean): void {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      console.error(`Tab not found: ${tabId}`);
      return;
    }

    tab.isDirty = isDirty;
    this.notifyTabsUpdate();
  }

  public async getWorkspaceFiles(): Promise<WorkspaceFile[]> {
    // Simulated workspace files - in real implementation would scan filesystem
    return [
      {
        path: '/workspace/src/main.ts',
        name: 'main.ts',
        content: '// Main application entry point\nconsole.log("Hello, YOLO-Browser!");',
        language: 'typescript',
        lastModified: new Date()
      },
      {
        path: '/workspace/README.md',
        name: 'README.md',
        content: '# YOLO-Browser\n\nAn autonomous web automation platform.',
        language: 'markdown',
        lastModified: new Date()
      }
    ];
  }

  public async refreshWorkspace(): Promise<void> {
    console.log('Refreshing workspace...');
    // Implementation would rescan the filesystem
  }

  // Private helper methods
  private createWelcomeTab(): void {
    const welcomeContent = `// Welcome to YOLO-Browser!
// 
// This is your autonomous web automation platform.
// Start by creating a new file or opening an existing one.
//
// Keyboard shortcuts:
// - Ctrl/Cmd + N: New file
// - Ctrl/Cmd + O: Open file
// - Ctrl/Cmd + S: Save file
// - Ctrl/Cmd + Shift + S: Save as
// - Ctrl/Cmd + W: Close tab
//
// Features:
// - 28+ programming languages supported
// - Advanced syntax highlighting and IntelliSense
// - AI-powered code assistance
// - Browser automation integration
// - Terminal integration
//
// Get started by pressing Ctrl/Cmd + N to create a new file!

console.log("Welcome to YOLO-Browser!");
`;

    const tab: FileTabInfo = {
      id: 'welcome-tab',
      filename: 'Welcome.ts',
      content: welcomeContent,
      isDirty: false,
      language: 'typescript',
      isActive: true
    };

    this.tabs.set('welcome-tab', tab);
    this.activeTabId = 'welcome-tab';
    this.notifyTabsUpdate();
  }

  private detectLanguage(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || '';
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'markdown': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'py': 'python',
      'java': 'java',
      'cs': 'csharp',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'c': 'c',
      'h': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'r': 'r',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'ps1': 'powershell',
      'txt': 'plaintext'
    };

    return languageMap[ext] || 'plaintext';
  }

  private getDefaultContent(filename: string): string {
    const language = this.detectLanguage(filename);
    
    const templates: Record<string, string> = {
      'typescript': '// TypeScript file\nconsole.log("Hello, TypeScript!");\n',
      'javascript': '// JavaScript file\nconsole.log("Hello, JavaScript!");\n',
      'html': '<!DOCTYPE html>\n<html>\n<head>\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n',
      'css': '/* CSS Stylesheet */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}\n',
      'json': '{\n    "name": "example",\n    "version": "1.0.0"\n}\n',
      'markdown': '# Document Title\n\nYour content here...\n',
      'python': '# Python script\nprint("Hello, Python!")\n',
      'plaintext': ''
    };

    return templates[language] || '';
  }

  private extractFilename(filepath: string): string {
    return filepath.split(/[\\/]/).pop() || filepath;
  }

  private async readFileContent(filepath: string): Promise<string> {
    // Simulated file reading - in real implementation would use Electron APIs
    console.log(`Reading file: ${filepath}`);
    return `// Content of ${filepath}\n// This is simulated content for development\n`;
  }

  private async writeFileContent(filepath: string, content: string): Promise<void> {
    // Simulated file writing - in real implementation would use Electron APIs
    console.log(`Writing file: ${filepath} (${content.length} characters)`);
  }

  private async showSaveDialog(defaultFilename: string): Promise<string | null> {
    // Simulated save dialog - in real implementation would use Electron APIs
    const filename = prompt(`Save file as:`, defaultFilename);
    return filename ? `/workspace/${filename}` : null;
  }

  private confirmUnsavedChanges(filename: string): boolean | null {
    const result = confirm(
      `${filename} has unsaved changes. Do you want to save before closing?`
    );
    return result;
  }

  private notifyTabsUpdate(): void {
    this.onTabsUpdate?.(this.getAllTabs());
  }
}
