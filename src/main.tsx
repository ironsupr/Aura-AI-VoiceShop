import React from 'react'
import ReactDOM from 'react-dom/client'
// import TestComponent from './TestComponent.tsx'
import App from './App.tsx'
import './index.css'
import { testFirebaseConnection } from './services/firebase'

// Test Firebase connection on app startup
testFirebaseConnection().then((isConnected) => {
  if (isConnected) {
    console.log('✅ Firebase initialized successfully');
  } else {
    console.error('❌ Firebase initialization failed');
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <TestComponent /> */}
    <App />
  </React.StrictMode>,
)