// Mock hook for Electron functionality
import { useState, useEffect, useCallback } from 'react';

export interface FileOperationResult {
  success: boolean;
  content?: string;
  error?: string;
  canceled?: boolean;
}

export const useElectron = () => {
  const [isElectron] = useState(false); // Mock as false since we're in browser
  const [platform] = useState('web');

  const showNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else {
      console.log(`Notification: ${title} - ${body}`);
    }
  }, []);

  const saveFile = useCallback(async (content: string, defaultName: string): Promise<FileOperationResult> => {
    try {
      // Mock file save in browser
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  const openFile = useCallback(async (): Promise<FileOperationResult> => {
    try {
      // Mock file open in browser
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.md';
      
      return new Promise((resolve) => {
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            resolve({ success: false, canceled: true });
            return;
          }
          
          const reader = new FileReader();
          reader.onload = () => {
            resolve({ success: true, content: reader.result as string });
          };
          reader.onerror = () => {
            resolve({ success: false, error: 'Failed to read file' });
          };
          reader.readAsText(file);
        };
        
        input.oncancel = () => {
          resolve({ success: false, canceled: true });
        };
        
        input.click();
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  const useMenuActions = useCallback((actions: Record<string, () => void>) => {
    // Mock menu actions - in real Electron app, these would be handled by main process
    useEffect(() => {
      const handleKeydown = (e: KeyboardEvent) => {
        const isMac = navigator.platform.includes('Mac');
        const cmdKey = isMac ? e.metaKey : e.ctrlKey;
        
        if (cmdKey) {
          switch (e.key) {
            case 's':
              e.preventDefault();
              actions['save-document']?.();
              break;
            case 'o':
              e.preventDefault();
              actions['open-document']?.();
              break;
            case 'n':
              e.preventDefault();
              actions['new-document']?.();
              break;
          }
        }
        
        // Function keys
        if (e.key === 'F1') {
          e.preventDefault();
          actions['toggle-dictation']?.();
        }
        if (e.key === 'F2') {
          e.preventDefault();
          actions['toggle-keyboard']?.();
        }
      };
      
      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
    }, [actions]);
  }, []);

  const shortcuts = {
    save: navigator.platform.includes('Mac') ? 'Cmd+S' : 'Ctrl+S',
    open: navigator.platform.includes('Mac') ? 'Cmd+O' : 'Ctrl+O',
    dictation: 'F1',
    keyboard: 'F2'
  };

  return {
    isElectron,
    platform,
    showNotification,
    saveFile,
    openFile,
    useMenuActions,
    shortcuts
  };
};