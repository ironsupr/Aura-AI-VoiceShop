// Firebase Authentication Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService, { AuthUser } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthUser>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signInWithGoogle: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔧 AuthProvider: Initializing authentication...');
    
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      console.log('🔧 AuthProvider: Auth state changed:', user ? 'User logged in' : 'No user');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string): Promise<AuthUser> => {
    setLoading(true);
    try {
      const user = await AuthService.signUpWithEmail(email, password, displayName);
      setUser(user);
      return user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthUser> => {
    setLoading(true);
    try {
      const user = await AuthService.signInWithEmail(email, password);
      setUser(user);
      return user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<AuthUser> => {
    setLoading(true);
    try {
      const user = await AuthService.signInWithGoogle();
      setUser(user);
      return user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    return AuthService.resetPassword(email);
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    return AuthService.updateUserPassword(currentPassword, newPassword);
  };

  const updateProfile = async (updates: { displayName?: string; photoURL?: string }): Promise<void> => {
    await AuthService.updateUserProfile(updates);
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
