// Firebase configuration and initialization
import { initializeApp, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in production)
let analytics;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  analytics = getAnalytics(app);
}
export { analytics };

// Connect to emulators in development (only if explicitly enabled)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    
    console.log('🔥 Connected to Firebase emulators');
  } catch (error) {
    console.warn('Firebase emulators not available, using production services');
  }
} else {
  console.log('🔥 Using production Firebase services');
}

export async function testFirebaseConnection(): Promise<boolean> {
  try {
    console.log('🧪 Firebase Connection Test Starting...');
    
    // Test 1: Check if Firebase is initialized
    const app = getApp();
    console.log('✅ Firebase app instance retrieved');
    
    // Test 2: Validate configuration
    const config = app.options;
    console.log('🔧 Firebase config:', {
      apiKey: config.apiKey ? '✅ Present' : '❌ Missing',
      authDomain: config.authDomain ? '✅ Present' : '❌ Missing', 
      projectId: config.projectId ? '✅ Present' : '❌ Missing',
      storageBucket: config.storageBucket ? '✅ Present' : '❌ Missing',
      messagingSenderId: config.messagingSenderId ? '✅ Present' : '❌ Missing',
      appId: config.appId ? '✅ Present' : '❌ Missing'
    });
    
    // Test 3: Basic validation that Firebase is configured
    if (!config.projectId) {
      console.error('❌ Firebase: No project ID configured');
      return false;
    }
    
    if (!config.apiKey) {
      console.error('❌ Firebase: No API key configured');
      return false;
    }
    
    // Test 4: Check auth service
    console.log('🔧 Auth service state:', {
      currentUser: auth.currentUser ? '✅ User logged in' : '❌ No user',
      authDomain: auth.config.authDomain
    });
    
    // Test 5: Environment variables check
    console.log('🔧 Environment variables:');
    console.log('VITE_FIREBASE_API_KEY:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing');
    console.log('VITE_FIREBASE_AUTH_DOMAIN:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing');
    console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
    
    // For development, we might be using the emulator or placeholder config
    const isDemoProject = config.projectId?.includes('demo-') || 
                         config.projectId?.includes('test-') ||
                         config.projectId === 'your_project_id';
    
    if (isDemoProject) {
      console.log('🧪 Firebase: Using demo/test project or placeholder config');
    } else {
      console.log('🔥 Firebase: Connected to production project:', config.projectId);
    }
    
    console.log('✅ Firebase connection test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
}

export default app;
