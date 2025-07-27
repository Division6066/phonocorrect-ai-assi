import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  subscriptionStatus: 'free' | 'active' | 'canceled' | 'past_due';
  subscriptionId?: string;
  customerId?: string;
  createdAt: any;
  lastLoginAt: any;
}

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock user for development
  const mockUser = {
    uid: 'mock-user-123',
    email: 'demo@phonocorrect.ai',
    displayName: 'Demo User'
  };

  const mockUserProfile: UserProfile = {
    uid: 'mock-user-123',
    email: 'demo@phonocorrect.ai',
    displayName: 'Demo User',
    subscriptionStatus: 'free' as const,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser(mockUser);
      setUserProfile(mockUserProfile);
      setLoading(false);
    }, 1000);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setTimeout(() => {
      setUser({ ...mockUser, email, displayName });
      setUserProfile({ ...mockUserProfile, email, displayName });
      setLoading(false);
    }, 1000);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setTimeout(() => {
      setUser(mockUser);
      setUserProfile(mockUserProfile);
      setLoading(false);
    }, 1000);
  };

  const logout = async () => {
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    // Mock implementation
    console.log('Password reset requested for:', email);
  };

  const refreshUserProfile = async () => {
    // Mock implementation
    if (user) {
      setUserProfile(mockUserProfile);
    }
  };

  const isPremium = userProfile?.subscriptionStatus === 'active';

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      logout,
      resetPassword,
      refreshUserProfile,
      isPremium
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};