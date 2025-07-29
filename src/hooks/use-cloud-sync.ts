import { useState, useCallback, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  isPremium: boolean;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';
  subscriptionEnds?: Date;
  trialEnds?: Date;
  planType?: 'monthly' | 'yearly';
  deviceLimit: number;
  storageUsed: number;
  storageLimit: number;
  createdAt: Date;
  lastLogin?: Date;
}

export interface CloudSyncState {
  isAuthenticated: boolean;
  user: User | null;
  syncing: boolean;
  lastSync: Date | null;
  syncError: string | null;
  connectionStatus: 'online' | 'offline';
  deviceCount: number;
  billingInfo?: {
    nextBilling?: Date;
    amount?: number;
    currency?: string;
    paymentMethod?: string;
  };
}

export interface PremiumFeatures {
  cloudSync: boolean;
  advancedML: boolean;
  multiDevice: boolean;
  prioritySupport: boolean;
  exportFormats: boolean;
  voiceCloning: boolean;
  unlimitedStorage: boolean;
  batchProcessing: boolean;
  apiAccess: boolean;
  customVoices: boolean;
  offlineML: boolean;
  documentHistory: boolean;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

// Mock Firebase/Firestore implementation with enhanced billing
class CloudSyncService {
  private isAuthenticated = false;
  private currentUser: User | null = null;
  private deviceCount = 1;

  private billingPlans: BillingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: [
        'Basic phonetic corrections',
        'Limited local storage',
        '1 device sync',
        'Community support'
      ]
    },
    {
      id: 'premium_monthly',
      name: 'Premium',
      price: 5,
      currency: 'USD',
      interval: 'month',
      popular: true,
      features: [
        'Advanced ML models',
        'Unlimited cloud storage',
        '5 device sync',
        'Voice cloning',
        'Export formats',
        'Priority support',
        'Offline ML processing',
        'Document history'
      ]
    },
    {
      id: 'premium_yearly',
      name: 'Premium Annual',
      price: 50,
      currency: 'USD',
      interval: 'year',
      features: [
        'All Premium features',
        '2 months free',
        'API access',
        'Custom voice models',
        'Batch processing',
        'Early access to features'
      ]
    }
  ];

  async signIn(email: string, password: string): Promise<User> {
    // Mock authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'test@example.com' && password === 'password123') {
      this.currentUser = {
        id: 'user_123',
        email,
        displayName: 'Test User',
        isPremium: false,
        deviceLimit: 1,
        storageUsed: 0,
        storageLimit: 100, // MB
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date()
      };
      this.isAuthenticated = true;
      return this.currentUser;
    } else if (email === 'premium@example.com' && password === 'premium123') {
      // Demo premium user
      this.currentUser = {
        id: 'user_premium',
        email,
        displayName: 'Premium User',
        isPremium: true,
        subscriptionId: 'sub_premium123',
        subscriptionStatus: 'active',
        subscriptionEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        planType: 'monthly',
        deviceLimit: 5,
        storageUsed: 45,
        storageLimit: 1000, // MB
        createdAt: new Date('2023-12-01'),
        lastLogin: new Date()
      };
      this.isAuthenticated = true;
      return this.currentUser;
    }
    
    throw new Error('Invalid credentials. Try test@example.com/password123 or premium@example.com/premium123');
  }

  async signUp(email: string, password: string): Promise<User> {
    // Mock user creation
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    this.currentUser = {
      id: `user_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      isPremium: false,
      trialEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
      deviceLimit: 1,
      storageUsed: 0,
      storageLimit: 100,
      createdAt: new Date(),
      lastLogin: new Date()
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
    
    // Check storage limits for non-premium users
    if (!this.currentUser?.isPremium) {
      const dataSize = JSON.stringify(data).length / 1024 / 1024; // MB
      if (this.currentUser && this.currentUser.storageUsed + dataSize > this.currentUser.storageLimit) {
        throw new Error('Storage limit exceeded. Upgrade to Premium for unlimited storage.');
      }
    }
    
    // Mock cloud sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate potential sync failures
    if (Math.random() < 0.05) {
      throw new Error('Sync failed: Network timeout');
    }
    
    // Update storage usage
    if (this.currentUser) {
      this.currentUser.storageUsed = Math.min(this.currentUser.storageLimit, 
        this.currentUser.storageUsed + 0.1);
    }
  }

  async getUserData(): Promise<any> {
    if (!this.isAuthenticated) throw new Error('Not authenticated');
    
    // Mock fetching user data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      preferences: [
        { pattern: 'fone', correction: 'phone', confidence: 0.95 },
        { pattern: 'seperate', correction: 'separate', confidence: 0.98 }
      ],
      documents: [
        { id: '1', title: 'My Notes', content: 'Sample document content...', lastModified: new Date() }
      ],
      settings: {
        autoSync: this.currentUser?.isPremium || false,
        voicePreference: 'natural',
        language: 'en-US'
      },
      lastModified: new Date()
    };
  }

  async upgradeToPremium(planId: string = 'premium_monthly'): Promise<User> {
    if (!this.currentUser) throw new Error('Not authenticated');
    
    // Mock Stripe integration
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const plan = this.billingPlans.find(p => p.id === planId);
    if (!plan) throw new Error('Invalid plan');
    
    const subscriptionEnds = plan.interval === 'year' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    this.currentUser = {
      ...this.currentUser,
      isPremium: true,
      subscriptionId: `sub_${Date.now()}`,
      subscriptionStatus: 'active',
      subscriptionEnds,
      planType: plan.interval === 'year' ? 'yearly' : 'monthly',
      deviceLimit: 5,
      storageLimit: plan.interval === 'year' ? 10000 : 1000, // GB for yearly, MB for monthly
      trialEnds: undefined
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

  async getBillingPlans(): Promise<BillingPlan[]> {
    return this.billingPlans;
  }

  async getBillingInfo(): Promise<any> {
    if (!this.currentUser?.isPremium) return null;
    
    const nextBilling = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000); // 25 days from now
    
    return {
      nextBilling,
      amount: this.currentUser.planType === 'yearly' ? 50 : 5,
      currency: 'USD',
      paymentMethod: '**** **** **** 4242'
    };
  }

  async getDeviceCount(): Promise<number> {
    return this.deviceCount;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) throw new Error('Not authenticated');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    this.currentUser = { ...this.currentUser, ...updates };
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
    connectionStatus: 'online',
    deviceCount: 1
  });

  const [localData, setLocalData] = useKV('local-user-data', {
    preferences: [],
    documents: [],
    settings: {}
  });

  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([]);

  // Load billing plans on mount
  useEffect(() => {
    cloudService.getBillingPlans().then(setBillingPlans);
  }, []);

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

  // Auto-sync when online and premium
  useEffect(() => {
    if (syncState.isAuthenticated && syncState.user?.isPremium && syncState.connectionStatus === 'online') {
      const interval = setInterval(() => {
        syncToCloud();
      }, 2 * 60 * 1000); // Sync every 2 minutes for premium users

      return () => clearInterval(interval);
    }
  }, [syncState.isAuthenticated, syncState.user?.isPremium, syncState.connectionStatus]);

  // Load billing info after authentication
  useEffect(() => {
    if (syncState.isAuthenticated && syncState.user?.isPremium) {
      cloudService.getBillingInfo().then(billingInfo => {
        setSyncState(prev => ({ ...prev, billingInfo }));
      });
      
      cloudService.getDeviceCount().then(deviceCount => {
        setSyncState(prev => ({ ...prev, deviceCount }));
      });
    }
  }, [syncState.isAuthenticated, syncState.user?.isPremium]);

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
        lastSync: null,
        billingInfo: undefined,
        deviceCount: 1
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
      throw error;
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
      throw error;
    }
  }, [syncState.isAuthenticated, syncState.connectionStatus, setLocalData]);

  const upgradeToPremium = useCallback(async (planId?: string) => {
    try {
      const updatedUser = await cloudService.upgradeToPremium(planId);
      setSyncState(prev => ({
        ...prev,
        user: updatedUser,
        syncError: null
      }));
      
      // Reload billing info
      const billingInfo = await cloudService.getBillingInfo();
      setSyncState(prev => ({ ...prev, billingInfo }));
      
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

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const updatedUser = await cloudService.updateProfile(updates);
      setSyncState(prev => ({
        ...prev,
        user: updatedUser,
        syncError: null
      }));
      return updatedUser;
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        syncError: error instanceof Error ? error.message : 'Profile update failed'
      }));
      throw error;
    }
  }, []);

  const getPremiumFeatures = useCallback((): PremiumFeatures => {
    const isPremium = syncState.user?.isPremium || false;
    const isTrialing = syncState.user?.trialEnds && syncState.user.trialEnds > new Date();
    const hasAccess = isPremium || isTrialing;
    
    return {
      cloudSync: hasAccess || false,
      advancedML: hasAccess || false,
      multiDevice: hasAccess || false,
      prioritySupport: hasAccess || false,
      exportFormats: hasAccess || false,
      voiceCloning: hasAccess || false,
      unlimitedStorage: isPremium || false, // Trial users get limited storage
      batchProcessing: isPremium || false,
      apiAccess: (isPremium && syncState.user?.planType === 'yearly') || false,
      customVoices: isPremium || false,
      offlineML: hasAccess || false,
      documentHistory: hasAccess || false
    };
  }, [syncState.user?.isPremium, syncState.user?.trialEnds, syncState.user?.planType]);

  const updateLocalData = useCallback((updates: Partial<typeof localData>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
    
    // Auto-sync after local changes if premium
    if (syncState.user?.isPremium && syncState.connectionStatus === 'online') {
      setTimeout(syncToCloud, 1000); // Debounced sync
    }
  }, [setLocalData, syncState.user?.isPremium, syncState.connectionStatus, syncToCloud]);

  const getStorageInfo = useCallback(() => {
    if (!syncState.user) return null;
    
    return {
      used: syncState.user.storageUsed,
      limit: syncState.user.storageLimit,
      percentage: (syncState.user.storageUsed / syncState.user.storageLimit) * 100,
      isUnlimited: syncState.user.isPremium && syncState.user.planType === 'yearly'
    };
  }, [syncState.user]);

  const isTrialActive = useCallback(() => {
    return syncState.user?.trialEnds && syncState.user.trialEnds > new Date();
  }, [syncState.user?.trialEnds]);

  const getTrialDaysLeft = useCallback(() => {
    if (!syncState.user?.trialEnds) return 0;
    const now = new Date();
    const diffTime = syncState.user.trialEnds.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [syncState.user?.trialEnds]);

  return {
    syncState,
    signIn,
    signUp,
    signOut,
    syncToCloud,
    pullFromCloud,
    upgradeToPremium,
    cancelSubscription,
    updateProfile,
    getPremiumFeatures,
    updateLocalData,
    getStorageInfo,
    isTrialActive,
    getTrialDaysLeft,
    billingPlans,
    localData
  };
}