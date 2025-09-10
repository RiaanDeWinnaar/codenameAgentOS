import { app, BrowserWindow, Menu, ipcMain, dialog, session, WebContentsView } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let currentWebContentsView: WebContentsView | null = null;
let webContentsAttached = false; // track attachment state for show/hide logic

// Enable live reload for development
const isDevelopment = isDev;
if (isDevelopment) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(
        __dirname,
        '..',
        '..',
        'node_modules',
        '.bin',
        'electron'
      ),
      hardResetMethod: 'exit',
    });
  } catch (error) {
    console.log('Electron-reload not available or failed to load:', error);
  }
}

/**
 * Create the main application window
 */
function createMainWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    show: false, // Don't show until ready
    titleBarStyle: 'default',
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'), // Will add later
    title: 'YOLO-Browser - Autonomous Web Platform',
  });

  // Load the app
  // For testing Monaco Editor, temporarily force production mode
  const forceProduction = true;
  
  if (isDevelopment && !forceProduction) {
    // Development server
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production build
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
    // Open DevTools for testing Monaco Editor
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links - open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      require('electron').shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

/**
 * Create application menu
 */
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Placeholder for new project functionality
          },
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            dialog
              .showOpenDialog(mainWindow!, {
                properties: ['openDirectory'],
                title: 'Open Project Folder',
              })
              .then(result => {
                if (!result.canceled && result.filePaths.length > 0) {
                  console.log('Opening project:', result.filePaths[0]);
                }
              });
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'YOLO Mode',
      submenu: [
        {
          label: 'Enable YOLO Mode',
          type: 'checkbox',
          checked: false,
          click: menuItem => {
            // Placeholder for YOLO Mode toggle
            console.log(
              'YOLO Mode:',
              menuItem.checked ? 'Enabled' : 'Disabled'
            );
          },
        },
        {
          label: 'Trust Settings',
          click: () => {
            // Placeholder for trust settings dialog
            console.log('Opening trust settings...');
          },
        },
        {
          label: 'View Audit Log',
          click: () => {
            // Placeholder for audit log viewer
            console.log('Opening audit log...');
          },
        },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'close' }],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About YOLO-Browser',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About YOLO-Browser',
              message: 'YOLO-Browser v1.0.0',
              detail:
                'Autonomous Web Automation Platform\n\nBuilt with Electron, React, and TypeScript',
            });
          },
        },
        {
          label: 'Documentation',
          click: () => {
            require('electron').shell.openExternal(
              'https://github.com/RiaanDeWinnaar/codenameAgentOS'
            );
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });

    // Window menu
    template[template.length - 2].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Setup IPC handlers for communication with renderer process
 */
function setupIPC(): void {
  // Example IPC handlers - will be expanded as features are added

  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('app:getName', () => {
    return app.getName();
  });

  ipcMain.handle('app:isPackaged', () => {
    return app.isPackaged;
  });

  ipcMain.handle('app:getAppInfo', () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      isPackaged: app.isPackaged
    };
  });

  // File system operations
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'JavaScript', extensions: ['js', 'jsx'] },
        { name: 'TypeScript', extensions: ['ts', 'tsx'] },
        { name: 'HTML', extensions: ['html', 'htm'] },
        { name: 'CSS', extensions: ['css', 'scss', 'sass'] },
      ],
    });

    return result;
  });

  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory'],
    });

    return result;
  });

  // Window management
  ipcMain.handle('window:minimize', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.handle('window:close', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  // Console logging from renderer
  ipcMain.on('log:info', (_, message) => {
    console.log('[Renderer]', message);
  });

  ipcMain.on('log:error', (_, message) => {
    console.error('[Renderer]', message);
  });

  // Browser automation handlers
  ipcMain.handle('browser:createWebContentsView', async (_, options) => {
    try {
      if (!mainWindow) {
        return { success: false, error: 'Main window not available' };
      }

      // Clean up existing WebContentsView if any
      if (currentWebContentsView) {
        try {
          mainWindow.contentView.removeChildView(currentWebContentsView);
        } catch { /* ignore */ }
        currentWebContentsView = null;
        webContentsAttached = false;
      }

      // Create new WebContentsView
      currentWebContentsView = new WebContentsView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true,
          ...options.webPreferences,
        },
      });

  // Add to main window immediately (renderer will update precise bounds afterwards)
  mainWindow.contentView.addChildView(currentWebContentsView);
  webContentsAttached = true;
  // Temporary starter bounds to avoid 0 size before renderer sends update
  const bounds = options.bounds || { x: 0, y: 120, width: 800, height: 600 };
  try { currentWebContentsView.setBounds(bounds); } catch { /* ignore */ }

      // Set up event listeners for browser events
      const webContents = currentWebContentsView.webContents;
      
      webContents.on('did-navigate', (event, url) => {
        mainWindow?.webContents.send('browser-did-navigate', {
          webContentsId: webContents.id,
          url,
          title: webContents.getTitle(),
        });
      });

      webContents.on('dom-ready', () => {
        mainWindow?.webContents.send('browser-dom-ready', {
          webContentsId: webContents.id,
        });
      });

      webContents.on('did-start-loading', () => {
        mainWindow?.webContents.send('browser-did-start-loading', {
          webContentsId: webContents.id,
        });
      });

      webContents.on('did-stop-loading', () => {
        mainWindow?.webContents.send('browser-did-stop-loading', {
          webContentsId: webContents.id,
        });
      });

      webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        mainWindow?.webContents.send('browser-did-fail-load', {
          webContentsId: webContents.id,
          errorCode,
          errorDescription,
          validatedURL,
        });
      });

      // Navigation state updates
      const updateNavigationState = () => {
        // Intentionally disabled detailed navigation state to eliminate serialization errors.
        // Can be re-enabled once root cause is fully diagnosed.
        try {
          const wcAny: any = webContents;
          const back = typeof wcAny.canGoBack === 'function' ? wcAny.canGoBack() : false;
          const forward = typeof wcAny.canGoForward === 'function' ? wcAny.canGoForward() : false;
          mainWindow?.webContents.send('browser-navigation-state', {
            webContentsId: webContents.id,
            canGoBack: back,
            canGoForward: forward,
          });
        } catch {/* ignore */}
      };

      // Instead of relying on internal navigationHistory events (causing serialization issues),
      // poll lightweight navigation capability flags while loading; clear when destroyed.
      const navInterval = setInterval(() => {
        if (!currentWebContentsView || webContents.isDestroyed()) {
          clearInterval(navInterval);
          return;
        }
        updateNavigationState();
      }, 750);
      webContents.once('destroyed', () => clearInterval(navInterval));

      // IMPORTANT: Do NOT return the WebContentsView instance itself; it is a native object
      // and cannot be structured‑cloned across the IPC boundary (was causing
      // 'An object could not be cloned' in renderer). Only return primitive / cloneable data.
      return {
        success: true,
        webContentsId: webContents.id,
      };
    } catch (error) {
      console.error('Failed to create WebContentsView:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Hide (detach) the WebContentsView without destroying its webContents
  ipcMain.handle('browser:hideWebContentsView', async () => {
    try {
      if (currentWebContentsView && mainWindow && webContentsAttached) {
        mainWindow.contentView.removeChildView(currentWebContentsView);
        webContentsAttached = false;
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to hide WebContentsView:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Show (re-attach) existing WebContentsView
  ipcMain.handle('browser:showWebContentsView', async () => {
    try {
      if (currentWebContentsView && mainWindow && !webContentsAttached) {
        mainWindow.contentView.addChildView(currentWebContentsView);
        webContentsAttached = true;
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to show WebContentsView:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Update bounds from renderer (panel resize / layout change)
  ipcMain.handle('browser:updateBounds', async (_, bounds: { x: number; y: number; width: number; height: number }) => {
    try {
      if (currentWebContentsView && webContentsAttached) {
        currentWebContentsView.setBounds(bounds);
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to update WebContentsView bounds:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('browser:destroyWebContentsView', async () => {
    try {
      if (currentWebContentsView && mainWindow) {
        mainWindow.contentView.removeChildView(currentWebContentsView);
        currentWebContentsView = null;
  webContentsAttached = false;
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to destroy WebContentsView:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('browser:getCurrentUrl', async () => {
    if (currentWebContentsView) {
      return currentWebContentsView.webContents.getURL();
    }
    return 'about:blank';
  });

  ipcMain.handle('browser:navigateTo', async (_, url) => {
    if (currentWebContentsView) {
      await currentWebContentsView.webContents.loadURL(url);
      return { success: true };
    }
    return { success: false, error: 'No WebContentsView available' };
  });

  ipcMain.handle('browser:goBack', async () => {
    const wc: any = currentWebContentsView?.webContents;
    if (wc && typeof wc.canGoBack === 'function' && wc.canGoBack()) {
      wc.goBack();
      return { success: true };
    }
    return { success: false, error: 'Cannot go back' };
  });

  ipcMain.handle('browser:goForward', async () => {
    const wc: any = currentWebContentsView?.webContents;
    if (wc && typeof wc.canGoForward === 'function' && wc.canGoForward()) {
      wc.goForward();
      return { success: true };
    }
    return { success: false, error: 'Cannot go forward' };
  });

  ipcMain.handle('browser:reload', async () => {
    if (currentWebContentsView) {
      currentWebContentsView.webContents.reload();
      return { success: true };
    }
    return { success: false, error: 'No WebContentsView available' };
  });

  ipcMain.handle('browser:executeJavaScript', async (_, script) => {
    if (currentWebContentsView) {
      try {
        const result = await currentWebContentsView.webContents.executeJavaScript(script);
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    return { success: false, error: 'No WebContentsView available' };
  });

  // Tab management (placeholder implementations)
  ipcMain.handle('browser:createTab', async (_, url) => {
  // Placeholder for multi-tab support
    const tabId = `tab-${Date.now()}`;
    console.log('Creating tab:', tabId, 'URL:', url);
    return tabId;
  });

  ipcMain.handle('browser:closeTab', async (_, tabId) => {
  // Placeholder for multi-tab support
    console.log('Closing tab:', tabId);
    return { success: true };
  });

  ipcMain.handle('browser:switchToTab', async (_, tabId) => {
  // Placeholder for multi-tab support
    console.log('Switching to tab:', tabId);
    return { success: true };
  });

  // Navigation state and information
  ipcMain.handle('browser:getNavigationState', async () => {
    if (currentWebContentsView) {
      const webContents: any = currentWebContentsView.webContents;
      return {
        success: true,
        canGoBack: typeof webContents.canGoBack === 'function' ? webContents.canGoBack() : false,
        canGoForward: typeof webContents.canGoForward === 'function' ? webContents.canGoForward() : false,
        isLoading: webContents.isLoading(),
        url: webContents.getURL(),
        title: webContents.getTitle(),
      };
    }
    return { success: false, error: 'No WebContentsView available' };
  });

  ipcMain.handle('browser:getPageInfo', async () => {
    if (currentWebContentsView) {
      const webContents: any = currentWebContentsView.webContents;
      return {
        success: true,
        url: webContents.getURL(),
        title: webContents.getTitle(),
        isLoading: webContents.isLoading(),
        canGoBack: typeof webContents.canGoBack === 'function' ? webContents.canGoBack() : false,
        canGoForward: typeof webContents.canGoForward === 'function' ? webContents.canGoForward() : false,
        webContentsId: webContents.id,
      };
    }
    return { success: false, error: 'No WebContentsView available' };
  });
}

/**
 * Configure session security
 */
function configureSecurity(): void {
  // Configure Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss: http://localhost:* https://*",
        ],
      },
    });
  });

  // Block certain permissions
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      // Allow required permissions for Monaco Editor and browser functionality
      const allowedPermissions = ['clipboard-read', 'clipboard-write'];
      callback(allowedPermissions.includes(permission));
    }
  );
}

// App event handlers
app.whenReady().then(() => {
  console.log('Electron app is ready');

  // Configure security before creating windows
  configureSecurity();

  // Setup IPC handlers
  setupIPC();

  // Create the main window
  createMainWindow();

  // Create application menu
  createMenu();

  // Handle app activation (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent navigation to external protocols
// Relax navigation restriction to permit standard https/http navigation inside embedded WebContentsView.
// We still block dangerous schemes.
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (navigationEvent, url) => {
    const allowedProtocols = ['http:', 'https:', 'file:'];
    try {
      const protocol = new URL(url).protocol;
      if (!allowedProtocols.includes(protocol)) {
        navigationEvent.preventDefault();
      }
    } catch {
      // If URL parsing fails, block navigation.
      navigationEvent.preventDefault();
    }
  });
});

// Handle certificate errors
app.on(
  'certificate-error',
  (event, webContents, url, error, certificate, callback) => {
    // In development, ignore certificate errors for localhost
    if (
      process.env.NODE_ENV === 'development' &&
      url.startsWith('http://localhost')
    ) {
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  }
);

// Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});

// Export for potential use in tests
export { createMainWindow, setupIPC };
