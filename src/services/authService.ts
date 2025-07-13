// Firebase Authentication service
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from './firebase';
import FirestoreService from './firestoreService';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
}

export class AuthService {
  private static googleProvider = new GoogleAuthProvider();

  // Convert Firebase User to our AuthUser interface
  private static formatUser(user: FirebaseUser): AuthUser {
    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || undefined,
      emailVerified: user.emailVerified
    };
  }

  // Email/Password Authentication
  static async signUpWithEmail(email: string, password: string, displayName: string): Promise<AuthUser> {
    try {
      console.log('🔧 AuthService: Attempting to sign up with email...');
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log('🔧 AuthService: User created successfully:', user.uid);
      
      // Update user profile with display name
      await updateProfile(user, { displayName });
      console.log('🔧 AuthService: Profile updated with display name');
      
      // Create user document in Firestore
      await FirestoreService.createUser(user.uid, {
        email,
        displayName,
        preferences: {
          favoriteCategories: [],
          voiceEnabled: true,
          notifications: true
        },
        addresses: []
      });

      return this.formatUser(user);
    } catch (error: any) {
      console.error('❌ AuthService: Sign up error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        fullError: error
      });
      
      // Handle the case where error code might be undefined
      const errorCode = error?.code || 'unknown';
      
      throw new Error(this.getAuthErrorMessage(errorCode));
    }
  }

  static async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      console.log('🔧 AuthService: Attempting to sign in with email...');
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log('🔧 AuthService: Sign in successful:', user.uid);
      
      // Update last login time
      await FirestoreService.updateUser(user.uid, {
        lastLoginAt: new Date() as any
      });

      return this.formatUser(user);
    } catch (error: any) {
      console.error('❌ AuthService: Sign in error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        fullError: error
      });
      
      // Handle the case where error code might be undefined
      const errorCode = error?.code || 'unknown';
      
      throw new Error(this.getAuthErrorMessage(errorCode));
    }
  }

  // Google Authentication
  static async signInWithGoogle(): Promise<AuthUser> {
    try {
      console.log('🔧 AuthService: Attempting to sign in with Google...');
      const { user } = await signInWithPopup(auth, this.googleProvider);
      
      // Check if user exists in Firestore, create if not
      const existingUser = await FirestoreService.getUser(user.uid);
      
      if (!existingUser) {
        await FirestoreService.createUser(user.uid, {
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
          preferences: {
            favoriteCategories: [],
            voiceEnabled: true,
            notifications: true
          },
          addresses: []
        });
      } else {
        // Update last login time
        await FirestoreService.updateUser(user.uid, {
          lastLoginAt: new Date() as any
        });
      }

      return this.formatUser(user);
    } catch (error: any) {
      console.error('❌ AuthService: Google sign in error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack,
        fullError: error
      });
      
      // Handle the case where error code might be undefined
      const errorCode = error?.code || 'unknown';
      
      throw new Error(this.getAuthErrorMessage(errorCode));
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Password reset
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Update password
  static async updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user');
      }

      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Password update error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Update profile
  static async updateUserProfile(updates: { displayName?: string; photoURL?: string }): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      await updateProfile(user, updates);
      
      // Also update in Firestore
      await FirestoreService.updateUser(user.uid, updates);
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Get current user
  static getCurrentUser(): AuthUser | null {
    const user = auth.currentUser;
    return user ? this.formatUser(user) : null;
  }

  // Auth state observer
  static onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    console.log('🔧 AuthService: Setting up auth state listener...');
    return onAuthStateChanged(auth, (user) => {
      console.log('🔧 AuthService: Auth state changed, user:', user ? `${user.email} (${user.uid})` : 'null');
      callback(user ? this.formatUser(user) : null);
    });
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  // Get user token
  static async getUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }

  // Error message helper
  private static getAuthErrorMessage(errorCode: string): string {
    console.log('🔧 AuthService: Processing error code:', errorCode);
    
    // Handle undefined or null error codes
    if (!errorCode) {
      return 'An unknown authentication error occurred.';
    }
    
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completion.';
      case 'auth/cancelled-popup-request':
        return 'Another popup is already open.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to perform this action.';
      case 'auth/invalid-api-key':
        return 'Invalid Firebase API key. Please check your configuration.';
      case 'auth/app-not-authorized':
        return 'App not authorized to use Firebase Authentication. Check your Firebase console.';
      case 'auth/api-key-not-valid':
        return 'Firebase API key is not valid for this project.';
      case 'auth/project-not-found':
        return 'Firebase project not found. Check your project ID.';
      case 'auth/domain-not-authorized':
        return 'Domain not authorized. Add your domain to Firebase console.';
      default:
        console.warn('🔧 AuthService: Unknown error code:', errorCode);
        return `Authentication error: ${errorCode || 'Unknown error'}`;
    }
  }
}

export default AuthService;
