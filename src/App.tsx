import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { VoiceProvider } from './context/VoiceContext';
import React, { Suspense, lazy, useEffect } from 'react';
import { testFirebaseConnection } from './services/firebase';

// Components
import SimpleHeader from './components/Header';
import SimpleFooter from './components/Footer';
import NotificationSystem from './components/NotificationSystem';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded components
const AuraAssistant = lazy(() => import('./components/AuraAssistant'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductListingPage = lazy(() => import('./pages/ProductListingPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("VoiceProvider Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded-md my-4">
          <h3 className="font-bold">Error in Voice System</h3>
          <p>{this.state.error?.message || "An unknown error occurred"}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

function MainContent() {

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SimpleHeader />
      <main className="flex-1">
        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListingPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>
      <SimpleFooter />
      
      {/* New Redesigned Aura Assistant */}
      <Suspense fallback={<div className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-100 animate-pulse">
        <div className="w-6 h-6"></div>
      </div>}>
        <AuraAssistant 
          position="bottom-right"
          theme="light"
          initialMode="compact"
          primaryColor="#4f46e5" 
          accentColor="#10b981"
        />
      </Suspense>
      
      {/* Notification System */}
      <NotificationSystem />
    </div>
  );
}

// Test Firebase connection on app startup
function FirebaseConnectionTest() {
  useEffect(() => {
    const testConnection = async () => {
      const isConnected = await testFirebaseConnection();
      if (isConnected) {
        console.log('✅ Firebase connection test passed');
      } else {
        console.warn('⚠️ Firebase connection test failed - check configuration');
      }
    };
    
    testConnection();
  }, []);
  
  return null; // This component doesn't render anything
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ErrorBoundary>
          <VoiceProvider>
            <Router>
              <MainContent />
              <FirebaseConnectionTest /> {/* Add Firebase connection test component */}
            </Router>
          </VoiceProvider>
        </ErrorBoundary>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;