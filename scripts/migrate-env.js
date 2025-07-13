#!/usr/bin/env node

/**
 * Migration script to update .env file with Firebase configuration
 * Run with: node scripts/migrate-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function migrateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  console.log('🔄 Migrating environment file for Firebase integration...');
  
  // Check if .env exists
  if (!fs.existsSync(envPath)) {
    console.log('📝 No .env file found. Creating from .env.example...');
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from .env.example');
      console.log('⚠️  Please update the Firebase configuration values in .env');
    } else {
      console.error('❌ No .env.example file found');
      return;
    }
  } else {
    // Read existing .env file
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if Firebase config already exists
    if (envContent.includes('VITE_FIREBASE_API_KEY')) {
      console.log('✅ Firebase configuration already exists in .env file');
      return;
    }
    
    console.log('📝 Adding Firebase configuration to existing .env file...');
    
    // Add Firebase configuration
    const firebaseConfig = `

# Firebase Configuration
# Replace these with your actual Firebase project configuration values
# You can find these in your Firebase Console -> Project Settings -> General -> Your apps

# Firebase API Key
VITE_FIREBASE_API_KEY=your_api_key_here

# Firebase Auth Domain (usually projectname.firebaseapp.com)
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com

# Firebase Project ID
VITE_FIREBASE_PROJECT_ID=your_project_id

# Firebase Storage Bucket (usually projectname.appspot.com)
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com

# Firebase Messaging Sender ID
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id

# Firebase App ID
VITE_FIREBASE_APP_ID=your_app_id

# Firebase Measurement ID (for Analytics - optional)
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
`;

    // Update REACT_APP_ variables to VITE_ if they exist
    let updatedContent = envContent
      .replace(/REACT_APP_GEMINI_API_KEY/g, 'VITE_GEMINI_API_KEY')
      .replace(/REACT_APP_GOOGLE_CLOUD_API_KEY/g, 'VITE_GOOGLE_CLOUD_API_KEY');
    
    // Append Firebase config
    updatedContent += firebaseConfig;
    
    // Write back to file
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ Firebase configuration added to .env file');
  }
  
  console.log('');
  console.log('🔥 Next Steps:');
  console.log('1. Create a Firebase project at https://console.firebase.google.com');
  console.log('2. Enable Firestore Database and Authentication');
  console.log('3. Copy your Firebase config from Project Settings');
  console.log('4. Update the Firebase values in your .env file');
  console.log('5. Run the app and check the browser console for connection status');
  console.log('');
  console.log('📚 For detailed setup instructions, see FIREBASE_SETUP.md');
}

function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found. Run this script from the project root.');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (!dependencies.firebase) {
    console.log('📦 Firebase not found in dependencies. Installing...');
    console.log('Run: npm install firebase');
    return false;
  }
  
  return true;
}

function main() {
  console.log('🚀 Aura AI Voice Shop - Firebase Migration Tool');
  console.log('================================================');
  
  if (!checkDependencies()) {
    console.log('⚠️  Please install dependencies first: npm install firebase');
    return;
  }
  
  migrateEnvFile();
}

main();
