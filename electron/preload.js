const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app-version'),
  getPlatform: () => ipcRenderer.invoke('platform'),

  // Window controls
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('set-always-on-top', flag),

  // Notifications
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),

  // File operations
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  openFile: () => ipcRenderer.invoke('open-file'),

  // Menu events - listen to menu actions from main process
  onMenuAction: (callback) => {
    const validChannels = [
      'new-document',
      'open-document', 
      'save-document',
      'clear-text',
      'start-dictation',
      'read-aloud',
      'toggle-keyboard',
      'open-preferences',
      'show-about',
      'show-guide',
      'toggle-dictation',
      'global-dictation',
      'global-keyboard'
    ];

    validChannels.forEach(channel => {
      ipcRenderer.on(channel, callback);
    });

    // Return cleanup function
    return () => {
      validChannels.forEach(channel => {
        ipcRenderer.removeListener(channel, callback);
      });
    };
  },

  // Remove menu listeners
  removeMenuListeners: (callback) => {
    ipcRenderer.removeListener('new-document', callback);
    ipcRenderer.removeListener('open-document', callback);
    ipcRenderer.removeListener('save-document', callback);
    ipcRenderer.removeListener('clear-text', callback);
    ipcRenderer.removeListener('start-dictation', callback);
    ipcRenderer.removeListener('read-aloud', callback);
    ipcRenderer.removeListener('toggle-keyboard', callback);
    ipcRenderer.removeListener('open-preferences', callback);
    ipcRenderer.removeListener('show-about', callback);
    ipcRenderer.removeListener('show-guide', callback);
    ipcRenderer.removeListener('toggle-dictation', callback);
    ipcRenderer.removeListener('global-dictation', callback);
    ipcRenderer.removeListener('global-keyboard', callback);
  },

  // System integration
  isElectron: true,
  
  // Global shortcuts info
  shortcuts: {
    dictation: 'CommandOrControl+Shift+D',
    keyboard: 'CommandOrControl+Shift+K',
    save: 'CommandOrControl+S',
    open: 'CommandOrControl+O',
    new: 'CommandOrControl+N'
  }
});