const { app, BrowserWindow, Menu, ipcMain, globalShortcut, Tray, nativeImage } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let tray;

// Enable live reload for Electron in development
if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/icon.png'), // Add app icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false, // Don't show until ready
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus window on creation
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window minimize to tray (optional)
  mainWindow.on('minimize', () => {
    if (process.platform === 'darwin') {
      // On macOS, minimize to dock
      mainWindow.hide();
    }
  });

  // Prevent navigation away from the app
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
}

function createTray() {
  // Create tray icon
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'assets/tray-icon.png'));
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show PhonoCorrect AI',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Quick Dictation',
      accelerator: 'CommandOrControl+Shift+D',
      click: () => {
        // Trigger global dictation mode
        if (mainWindow) {
          mainWindow.webContents.send('toggle-dictation');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Preferences',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('open-preferences');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('PhonoCorrect AI - Phonetic Spelling Assistant');
  tray.setContextMenu(contextMenu);

  // Show window on tray click
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    } else {
      createWindow();
    }
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Document',
          accelerator: 'CommandOrControl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('new-document');
            }
          }
        },
        {
          label: 'Open Document',
          accelerator: 'CommandOrControl+O',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-document');
            }
          }
        },
        {
          label: 'Save Document',
          accelerator: 'CommandOrControl+S',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('save-document');
            }
          }
        },
        { type: 'separator' },
        {
          role: process.platform === 'darwin' ? 'close' : 'quit'
        }
      ]
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
        { role: 'selectall' },
        { type: 'separator' },
        {
          label: 'Clear Text',
          accelerator: 'CommandOrControl+Shift+Delete',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('clear-text');
            }
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Start Dictation',
          accelerator: 'CommandOrControl+Shift+D',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('start-dictation');
            }
          }
        },
        {
          label: 'Read Aloud',
          accelerator: 'CommandOrControl+Shift+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('read-aloud');
            }
          }
        },
        {
          label: 'Show Virtual Keyboard',
          accelerator: 'CommandOrControl+Shift+K',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('toggle-keyboard');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'CommandOrControl+,',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('open-preferences');
            }
          }
        }
      ]
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
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About PhonoCorrect AI',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-about');
            }
          }
        },
        {
          label: 'User Guide',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-guide');
            }
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            require('electron').shell.openExternal('https://github.com/your-repo/issues');
          }
        }
      ]
    }
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
        { role: 'quit' }
      ]
    });

    // Window menu
    template[5].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
  createTray();

  // Register global shortcuts
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (mainWindow) {
      mainWindow.webContents.send('global-dictation');
    }
  });

  globalShortcut.register('CommandOrControl+Shift+K', () => {
    if (mainWindow) {
      mainWindow.webContents.send('global-keyboard');
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// IPC handlers for renderer communication
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('platform', () => {
  return process.platform;
});

ipcMain.handle('show-notification', (event, { title, body }) => {
  const { Notification } = require('electron');
  
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: path.join(__dirname, 'assets/icon.png')
    }).show();
  }
});

ipcMain.handle('minimize-to-tray', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('set-always-on-top', (event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag);
  }
});

// Handle file operations
ipcMain.handle('save-file', async (event, { defaultPath, data, filters }) => {
  const { dialog } = require('electron');
  
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters: filters || [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled && result.filePath) {
      const fs = require('fs');
      await fs.promises.writeFile(result.filePath, data, 'utf8');
      return { success: true, filePath: result.filePath };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file', async () => {
  const { dialog } = require('electron');
  
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const fs = require('fs');
      const content = await fs.promises.readFile(result.filePaths[0], 'utf8');
      return { 
        success: true, 
        content, 
        filePath: result.filePaths[0] 
      };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Export for testing
module.exports = { createWindow };