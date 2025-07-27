import { useEffect, useCallback, useState } from 'react';

interface ElectronAPI {
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  minimizeToTray: () => Promise<void>;
  setAlwaysOnTop: (flag: boolean) => Promise<void>;
  showNotification: (options: { title: string; body: string }) => Promise<void>;
  saveFile: (options: { defaultPath?: string; data: string; filters?: Array<{ name: string; extensions: string[] }> }) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
  openFile: () => Promise<{ success: boolean; content?: string; filePath?: string; canceled?: boolean; error?: string }>;
  onMenuAction: (callback: (event: any, action: string) => void) => () => void;
  removeMenuListeners: (callback: (event: any, action: string) => void) => void;
  isElectron: boolean;
  shortcuts: {
    dictation: string;
    keyboard: string;
    save: string;
    open: string;
    new: string;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [platform, setPlatform] = useState<string>('web');
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    const electronAPI = window.electronAPI;
    if (electronAPI?.isElectron) {
      setIsElectron(true);
      
      // Get platform and version
      electronAPI.getPlatform().then(setPlatform).catch(console.error);
      electronAPI.getVersion().then(setVersion).catch(console.error);
    }
  }, []);

  // Notification helper
  const showNotification = useCallback(async (title: string, body: string) => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.showNotification({ title, body });
      } catch (error) {
        console.error('Failed to show notification:', error);
        // Fallback to browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body });
        }
      }
    } else if ('Notification' in window) {
      // Browser notification fallback
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      }
    }
  }, [isElectron]);

  // File operations
  const saveFile = useCallback(async (data: string, defaultPath?: string) => {
    if (isElectron && window.electronAPI) {
      try {
        return await window.electronAPI.saveFile({
          data,
          defaultPath,
          filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
      } catch (error) {
        console.error('Failed to save file:', error);
        return { success: false, error: 'Failed to save file' };
      }
    } else {
      // Browser fallback - download file
      try {
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultPath || 'phonocorrect-document.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return { success: true };
      } catch (error) {
        console.error('Failed to download file:', error);
        return { success: false, error: 'Failed to download file' };
      }
    }
  }, [isElectron]);

  const openFile = useCallback(async () => {
    if (isElectron && window.electronAPI) {
      try {
        return await window.electronAPI.openFile();
      } catch (error) {
        console.error('Failed to open file:', error);
        return { success: false, error: 'Failed to open file' };
      }
    } else {
      // Browser fallback - file input
      return new Promise<{ success: boolean; content?: string; filePath?: string; canceled?: boolean; error?: string }>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,text/plain';
        
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const content = e.target?.result as string;
              resolve({ success: true, content, filePath: file.name });
            };
            reader.onerror = () => {
              resolve({ success: false, error: 'Failed to read file' });
            };
            reader.readAsText(file);
          } else {
            resolve({ success: false, canceled: true });
          }
        };
        
        input.click();
      });
    }
  }, [isElectron]);

  // Window controls
  const minimizeToTray = useCallback(async () => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.minimizeToTray();
      } catch (error) {
        console.error('Failed to minimize to tray:', error);
      }
    }
  }, [isElectron]);

  const setAlwaysOnTop = useCallback(async (flag: boolean) => {
    if (isElectron && window.electronAPI) {
      try {
        await window.electronAPI.setAlwaysOnTop(flag);
      } catch (error) {
        console.error('Failed to set always on top:', error);
      }
    }
  }, [isElectron]);

  // Menu action handler
  const useMenuActions = useCallback((handlers: { [key: string]: () => void }) => {
    useEffect(() => {
      if (!isElectron || !window.electronAPI) return;

      const handleMenuAction = (event: any, action: string) => {
        if (handlers[action]) {
          handlers[action]();
        }
      };

      const cleanup = window.electronAPI.onMenuAction(handleMenuAction);
      
      return cleanup;
    }, [handlers]);
  }, [isElectron]);

  return {
    isElectron,
    platform,
    version,
    showNotification,
    saveFile,
    openFile,
    minimizeToTray,
    setAlwaysOnTop,
    useMenuActions,
    shortcuts: window.electronAPI?.shortcuts || {
      dictation: 'Ctrl+Shift+D',
      keyboard: 'Ctrl+Shift+K',
      save: 'Ctrl+S',
      open: 'Ctrl+O',
      new: 'Ctrl+N'
    }
  };
}