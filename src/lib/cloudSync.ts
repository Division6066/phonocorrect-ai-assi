import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext-mock';

export interface SyncableData {
  customRules: Array<{
    id: string;
    pattern: string;
    replacement: string;
    category: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  learningData: Record<string, {
    pattern: string;
    acceptedCount: number;
    rejectedCount: number;
    lastUsed: Date;
  }>;
  preferences: {
    language: string;
    voiceSettings: any;
    keyboardLayout: string;
    [key: string]: any;
  };
}

class CloudSyncService {
  private static instance: CloudSyncService;
  
  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  async syncToCloud(userId: string, data: SyncableData, isPremium: boolean): Promise<boolean> {
    if (!isPremium) {
      throw new Error('Cloud sync requires Premium subscription');
    }

    try {
      const userDocRef = doc(db, 'userData', userId);
      
      await setDoc(userDocRef, {
        ...data,
        lastSyncedAt: serverTimestamp(),
        syncVersion: Date.now()
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      throw error;
    }
  }

  async syncFromCloud(userId: string, isPremium: boolean): Promise<SyncableData | null> {
    if (!isPremium) {
      throw new Error('Cloud sync requires Premium subscription');
    }

    try {
      const userDocRef = doc(db, 'userData', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          customRules: data.customRules || [],
          learningData: data.learningData || {},
          preferences: data.preferences || {}
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error syncing from cloud:', error);
      throw error;
    }
  }

  async hasCloudData(userId: string, isPremium: boolean): Promise<boolean> {
    if (!isPremium) return false;

    try {
      const userDocRef = doc(db, 'userData', userId);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists();
    } catch (error) {
      console.error('Error checking cloud data:', error);
      return false;
    }
  }

  async deleteCloudData(userId: string, isPremium: boolean): Promise<boolean> {
    if (!isPremium) {
      throw new Error('Cloud data operations require Premium subscription');
    }

    try {
      const userDocRef = doc(db, 'userData', userId);
      await setDoc(userDocRef, {
        customRules: [],
        learningData: {},
        preferences: {},
        deletedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error deleting cloud data:', error);
      throw error;
    }
  }

  async getLastSyncTime(userId: string, isPremium: boolean): Promise<Date | null> {
    if (!isPremium) return null;

    try {
      const userDocRef = doc(db, 'userData', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.lastSyncedAt?.toDate() || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }
}

// Hook for using cloud sync
export const useCloudSync = () => {
  const { user, isPremium } = useAuth();
  const syncService = CloudSyncService.getInstance();

  const syncToCloud = async (data: SyncableData): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }
    
    return await syncService.syncToCloud(user.uid, data, isPremium);
  };

  const syncFromCloud = async (): Promise<SyncableData | null> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }
    
    return await syncService.syncFromCloud(user.uid, isPremium);
  };

  const hasCloudData = async (): Promise<boolean> => {
    if (!user) return false;
    return await syncService.hasCloudData(user.uid, isPremium);
  };

  const deleteCloudData = async (): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }
    
    return await syncService.deleteCloudData(user.uid, isPremium);
  };

  const getLastSyncTime = async (): Promise<Date | null> => {
    if (!user) return null;
    return await syncService.getLastSyncTime(user.uid, isPremium);
  };

  return {
    syncToCloud,
    syncFromCloud,
    hasCloudData,
    deleteCloudData,
    getLastSyncTime,
    canSync: isPremium && !!user
  };
};

export default CloudSyncService;