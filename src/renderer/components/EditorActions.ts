import * as monaco from 'monaco-editor';

export interface EditorAction {
  id: string;
  label: string;
  keybinding?: number;
  contextMenuGroup?: string;
  run: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

export interface FileHandler {
  openFile: (content: string, filename: string) => void;
  saveFile: (content: string, filename: string) => Promise<boolean>;
  saveAsFile: (content: string) => Promise<string | null>;
  newFile: () => void;
}

/**
 * Enhanced Monaco Editor Actions and Commands
 * Provides VSCode-like functionality for YOLO-Browser
 */
export class MonacoActions {
  private readonly editor: monaco.editor.IStandaloneCodeEditor;
  private readonly fileHandler: FileHandler;
  private currentFilename: string | null = null;

  constructor(editor: monaco.editor.IStandaloneCodeEditor, fileHandler: FileHandler) {
    this.editor = editor;
    this.fileHandler = fileHandler;
    this.registerActions();
    this.registerCommands();
  }

  setCurrentFilename(filename: string | null) {
    this.currentFilename = filename;
  }

  private registerActions() {
    // File Operations
    this.editor.addAction({
      id: 'yolo.file.new',
      label: 'New File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN],
      contextMenuGroupId: 'file',
      contextMenuOrder: 1,
      run: () => {
        this.fileHandler.newFile();
        this.currentFilename = null;
      }
    });

    this.editor.addAction({
      id: 'yolo.file.save',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      contextMenuGroupId: 'file',
      contextMenuOrder: 2,
      run: async () => {
        const content = this.editor.getValue();
        if (this.currentFilename) {
          await this.fileHandler.saveFile(content, this.currentFilename);
        } else {
          const filename = await this.fileHandler.saveAsFile(content);
          if (filename) {
            this.currentFilename = filename;
          }
        }
      }
    });

    this.editor.addAction({
      id: 'yolo.file.saveAs',
      label: 'Save As...',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS],
      contextMenuGroupId: 'file',
      contextMenuOrder: 3,
      run: async () => {
        const content = this.editor.getValue();
        const filename = await this.fileHandler.saveAsFile(content);
        if (filename) {
          this.currentFilename = filename;
        }
      }
    });

    // Enhanced Editing Actions
    this.editor.addAction({
      id: 'yolo.edit.selectAll',
      label: 'Select All',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyA],
      contextMenuGroupId: 'edit',
      contextMenuOrder: 1,
      run: () => {
        const model = this.editor.getModel();
        if (model) {
          this.editor.setSelection(model.getFullModelRange());
        }
      }
    });

    this.editor.addAction({
      id: 'yolo.edit.duplicateLine',
      label: 'Duplicate Line',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD],
      contextMenuGroupId: 'edit',
      contextMenuOrder: 2,
      run: () => {
        this.editor.trigger('', 'editor.action.copyLinesDownAction', {});
      }
    });

    this.editor.addAction({
      id: 'yolo.edit.deleteLine',
      label: 'Delete Line',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK],
      contextMenuGroupId: 'edit',
      contextMenuOrder: 3,
      run: () => {
        this.editor.trigger('', 'editor.action.deleteLines', {});
      }
    });

    this.editor.addAction({
      id: 'yolo.edit.moveLineUp',
      label: 'Move Line Up',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.UpArrow],
      contextMenuGroupId: 'edit',
      contextMenuOrder: 4,
      run: () => {
        this.editor.trigger('', 'editor.action.moveLinesUpAction', {});
      }
    });

    this.editor.addAction({
      id: 'yolo.edit.moveLineDown',
      label: 'Move Line Down',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.DownArrow],
      contextMenuGroupId: 'edit',
      contextMenuOrder: 5,
      run: () => {
        this.editor.trigger('', 'editor.action.moveLinesDownAction', {});
      }
    });

    // Code Formatting
    this.editor.addAction({
      id: 'yolo.format.document',
      label: 'Format Document',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI],
      contextMenuGroupId: 'format',
      contextMenuOrder: 1,
      run: () => {
        this.editor.trigger('', 'editor.action.formatDocument', {});
      }
    });

    this.editor.addAction({
      id: 'yolo.format.selection',
      label: 'Format Selection',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
      contextMenuGroupId: 'format',
      contextMenuOrder: 2,
      run: () => {
        this.editor.trigger('', 'editor.action.formatSelection', {});
      }
    });

    // Navigation Actions
    this.editor.addAction({
      id: 'yolo.nav.goToLine',
      label: 'Go to Line...',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1,
      run: () => {
        this.editor.trigger('', 'editor.action.gotoLine', {});
      }
    });

    this.editor.addAction({
      id: 'yolo.nav.goToDefinition',
      label: 'Go to Definition',
      keybindings: [monaco.KeyCode.F12],
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 2,
      run: () => {
        this.editor.trigger('', 'editor.action.revealDefinition', {});
      }
    });

    // Find/Replace Actions
    this.editor.addAction({
      id: 'yolo.find.find',
      label: 'Find',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF],
      contextMenuGroupId: 'find',
      contextMenuOrder: 1,
      run: () => {
        this.editor.trigger('', 'actions.find', {});
      }
    });

    this.editor.addAction({
      id: 'yolo.find.replace',
      label: 'Replace',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH],
      contextMenuGroupId: 'find',
      contextMenuOrder: 2,
      run: () => {
        this.editor.trigger('', 'editor.action.startFindReplaceAction', {});
      }
    });

    // View Actions
    this.editor.addAction({
      id: 'yolo.view.toggleMinimap',
      label: 'Toggle Minimap',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyM],
      contextMenuGroupId: 'view',
      contextMenuOrder: 1,
      run: () => {
        const currentOptions = this.editor.getOptions();
        const minimapEnabled = currentOptions.get(monaco.editor.EditorOption.minimap).enabled;
        this.editor.updateOptions({
          minimap: { enabled: !minimapEnabled }
        });
      }
    });

    this.editor.addAction({
      id: 'yolo.view.toggleWordWrap',
      label: 'Toggle Word Wrap',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
      contextMenuGroupId: 'view',
      contextMenuOrder: 2,
      run: () => {
        const currentOptions = this.editor.getOptions();
        const wordWrap = currentOptions.get(monaco.editor.EditorOption.wordWrap);
        this.editor.updateOptions({
          wordWrap: wordWrap === 'on' ? 'off' : 'on'
        });
      }
    });

    // Code Intelligence Actions
    this.editor.addAction({
      id: 'yolo.code.commentLine',
      label: 'Toggle Line Comment',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash],
      contextMenuGroupId: 'code',
      contextMenuOrder: 1,
      run: () => {
        this.editor.trigger('', 'editor.action.commentLine', {});
      }
    });

    this.editor.addAction({
      id: 'yolo.code.blockComment',
      label: 'Toggle Block Comment',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Slash],
      contextMenuGroupId: 'code',
      contextMenuOrder: 2,
      run: () => {
        this.editor.trigger('', 'editor.action.blockComment', {});
      }
    });

    this.editor.addAction({
      id: 'yolo.code.rename',
      label: 'Rename Symbol',
      keybindings: [monaco.KeyCode.F2],
      contextMenuGroupId: 'code',
      contextMenuOrder: 3,
      run: () => {
        this.editor.trigger('', 'editor.action.rename', {});
      }
    });
  }

  private registerCommands() {
    // Register additional commands that can be triggered programmatically
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      // Quick action - could be used for AI suggestions
      console.log('Quick action triggered');
    });

    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      // Enhanced quick action - could be used for advanced AI features
      console.log('Enhanced quick action triggered');
    });
  }

  // Utility methods for external use
  public triggerAction(actionId: string) {
    this.editor.trigger('', actionId, {});
  }

  public getAvailableActions(): string[] {
    return [
      'yolo.file.new',
      'yolo.file.save',
      'yolo.file.saveAs',
      'yolo.edit.selectAll',
      'yolo.edit.duplicateLine',
      'yolo.edit.deleteLine',
      'yolo.edit.moveLineUp',
      'yolo.edit.moveLineDown',
      'yolo.format.document',
      'yolo.format.selection',
      'yolo.nav.goToLine',
      'yolo.nav.goToDefinition',
      'yolo.find.find',
      'yolo.find.replace',
      'yolo.view.toggleMinimap',
      'yolo.view.toggleWordWrap',
      'yolo.code.commentLine',
      'yolo.code.blockComment',
      'yolo.code.rename'
    ];
  }
}
