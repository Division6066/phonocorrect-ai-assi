import { useState, useCallback, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';

export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'canceled' | 'past_due';
  subscriptionEnds?: Date;
  createdAt: Date;
}

export interface CloudSyncState {
  isAuthenticated: boolean;
  user: User | null;
  syncing: boolean;
  lastSync: Date | null;
  syncError: string | null;
  connectionStatus: 'online' | 'offline';
}

export interface PremiumFeatures {
  cloudSync: boolean;
  advancedML: boolean;
  multiDevice: boolean;
  prioritySupport: boolean;
  exportFormats: boolean;
  voiceCloning: boolean;
}

// Mock Firebase/Firestore implementation
class CloudSyncService {
  private isAuthenticated = false;
  private currentUser: User | null = null;

  async signIn(email: string, password: string): Promise<User> {
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'test@example.com' && password === 'password123') {
      this.currentUser = {
        id: 'user_123',
        email,
        isPremium: false,
        createdAt: new Date()
      };
      this.isAuthenticated = true;
      return this.currentUser;
    }
    
    throw new Error('Invalid credentials');
  }

  async signUp(email: string, password: string): Promise<User> {
    // Mock user creation
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    this.currentUser = {
      id: `user_${Date.now()}`,
      email,
      isPremium: false,
      createdAt: new Date()
    };
    this.isAuthenticated = true;
    return this.currentUser;
  }

  async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.isAuthenticated = false;
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async syncUserData(data: any): Promise<void> {
    if (!this.isAuthenticated) throw new Error('Not authenticated');
    
    // Mock cloud sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate potential sync failures
    if (Math.random() < 0.1) {
      throw new Error('Sync failed: Network error');
    }
  }

  async getUserData(): Promise<any> {
    if (!this.isAuthenticated) throw new Error('Not authenticated');
    
    // Mock fetching user data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      preferences: [],
      documents: [],
      settings: {},
      lastModified: new Date()
    };
  }

  async upgradeToPremium(): Promise<User> {
    if (!this.currentUser) throw new Error('Not authenticated');
    
    // Mock Stripe integration
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    this.currentUser = {
      ...this.currentUser,
      isPremium: true,
      subscriptionId: `sub_${Date.now()}`,
      subscriptionStatus: 'active',
      subscriptionEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
    
    return this.currentUser;
  }

  async cancelSubscription(): Promise<User> {
    if (!this.currentUser) throw new Error('Not authenticated');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.currentUser = {
      ...this.currentUser,
      subscriptionStatus: 'canceled'
    };
    
    return this.currentUser;
  }
}

const cloudService = new CloudSyncService();

export function useCloudSync() {
  const [syncState, setSyncState] = useState<CloudSyncState>({
    isAuthenticated: false,
    user: null,
    syncing: false,
    lastSync: null,
    syncError: null,
    connectionStatus: 'online'
  });

  const [localData, setLocalData] = useKV('local-user-data', {
    preferences: [],
    documents: [],
    settings: {}
  });

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setSyncState(prev => ({ ...prev, connectionStatus: 'online' }));
    const handleOffline = () => setSyncState(prev => ({ ...prev, connectionStatus: 'offline' }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when online and authenticated
  useEffect(() => {
    if (syncState.isAuthenticated && syncState.connectionStatus === 'online') {
      const interval = setInterval(() => {
        syncToCloud();
      }, 5 * 60 * 1000); // Sync every 5 minutes

      return () => clearInterval(interval);
    }
  }, [syncState.isAuthenticated, syncState.connectionStatus]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const user = await cloudService.signIn(email, password);
      setSyncState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        syncError: null
      }));
      
      // Pull user data after sign in
      await pullFromCloud();
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        syncError: error instanceof Error ? error.message : 'Sign in failed'
      }));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const user = await cloudService.signUp(email, password);
      setSyncState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        syncError: null
      }));
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        syncError: error instanceof Error ? error.message : 'Sign up failed'
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await cloudService.signOut();
      setSyncState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        syncError: null,
        lastSync: null
      }));
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        syncError: error instanceof Error ? error.message : 'Sign out failed'
      }));
    }
  }, []);

  const syncToCloud = useCallback(async () => {
    if (!syncState.isAuthenticated || syncState.connectionStatus === 'offline') return;

    setSyncState(prev => ({ ...prev, syncing: true, syncError: null }));

    try {
      await cloudService.syncUserData(localData);
      setSyncState(prev => ({
        ...prev,
        syncing: false,
        lastSync: new Date()
      }));
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        syncing: false,
        syncError: error instanceof Error ? error.message : 'Sync failed'
      }));
    }
  }, [syncState.isAuthenticated, syncState.connectionStatus, localData]);

  const pullFromCloud = useCallback(async () => {
    if (!syncState.isAuthenticated || syncState.connectionStatus === 'offline') return;

    setSyncState(prev => ({ ...prev, syncing: true, syncError: null }));

    try {
      const cloudData = await cloudService.getUserData();
      setLocalData(cloudData);
      setSyncState(prev => ({
        ...prev,
        syncing: false,
        lastSync: new Date()
      }));
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        syncing: false,
        syncError: error instanceof Error ? error.message : 'Pull failed'
      }));
    }
  }, [syncState.isAuthenticated, syncState.connectionStatus, setLocalData]);

  const upgradeToPremium = useCallback(async () => {
    try {
      const updatedUser = await cloudService.upgradeToPremium();
      setSyncState(prev => ({
        ...prev,
        user: updatedUser,
        syncError: null
      }));
      return updatedUser;
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        syncError: error instanceof Error ? error.message : 'Upgrade failed'
      }));
      throw error;
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    try {
      const updatedUser = await cloudService.cancelSubscription();
      setSyncState(prev => ({
        ...prev,
        user: updatedUser,
        syncError: null
      }));
      return updatedUser;
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        syncError: error instanceof Error ? error.message : 'Cancellation failed'
      }));
      throw error;
    }
  }, []);

  const getPremiumFeatures = useCallback((): PremiumFeatures => {
    const isPremium = syncState.user?.isPremium || false;
    
    return {
      cloudSync: isPremium,
      advancedML: isPremium,
      multiDevice: isPremium,
      prioritySupport: isPremium,
      exportFormats: isPremium,
      voiceCloning: isPremium
    };
  }, [syncState.user?.isPremium]);

  const updateLocalData = useCallback((updates: Partial<typeof localData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
    
    // Auto-sync after local changes if premium
    if (syncState.user?.isPremium && syncState.connectionStatus === 'online') {
      setTimeout(syncToCloud, 1000); // Debounced sync
    }
  }, [setLocalData, syncState.user?.isPremium, syncState.connectionStatus, syncToCloud]);

  return {
    syncState,
    signIn,
    signUp,
    signOut,
    syncToCloud,
    pullFromCloud,
    upgradeToPremium,
    cancelSubscription,
    getPremiumFeatures,
    updateLocalData,
    localData
  };
}