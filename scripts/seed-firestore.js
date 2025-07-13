#!/usr/bin/env node

/**
 * Standalone Firestore seeding script
 * This script loads environment variables and seeds the Firestore database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables manually
function loadEnvVariables() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found. Please run npm run setup:firebase first.');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

// Load environment variables
loadEnvVariables();

// Now import Firebase modules
const { initializeApp } = await import('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, Timestamp } = await import('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key_here') {
  console.error('❌ Firebase configuration not found or incomplete.');
  console.error('Please update your .env file with actual Firebase configuration values.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample products data
const INITIAL_PRODUCTS = [
  {
    name: 'Apple iPhone 15 Pro Max',
    description: 'The latest iPhone with advanced camera and performance features',
    price: 1199.99,
    originalPrice: 1299.99,
    category: 'electronics',
    subcategory: 'smartphones',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop'
    ],
    keywords: ['phone', 'apple', 'iphone', 'smartphone', 'mobile', '5G', 'camera'],
    rating: 4.8,
    reviewCount: 2547,
    stock: 50,
    sizes: ['128GB', '256GB', '512GB', '1TB'],
    colors: ['Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium'],
    specifications: {
      display: '6.7" Super Retina XDR',
      processor: 'A17 Pro chip',
      camera: '48MP Main | 12MP Ultra Wide | 12MP Telephoto',
      battery: 'Up to 29 hours video playback'
    },
    features: ['Face ID', '5G capable', 'Wireless charging', 'Water resistant'],
    isOnSale: true,
    isFeatured: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen and advanced AI features',
    price: 1099.99,
    originalPrice: 1199.99,
    category: 'electronics',
    subcategory: 'smartphones',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=600&fit=crop'
    ],
    keywords: ['phone', 'samsung', 'galaxy', 'android', 'mobile', '5G', 'spen'],
    rating: 4.7,
    reviewCount: 1823,
    stock: 35,
    sizes: ['256GB', '512GB', '1TB'],
    colors: ['Titanium Black', 'Titanium Gray', 'Titanium Violet', 'Titanium Yellow'],
    specifications: {
      display: '6.8" Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3',
      camera: '200MP Main | 12MP Ultra Wide | 10MP Telephoto',
      battery: '5000mAh with 45W charging'
    },
    features: ['S Pen included', 'DeX support', 'Wireless charging', 'IP68 rating'],
    isOnSale: true,
    isFeatured: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'MacBook Pro 16-inch M3 Pro',
    description: 'Professional laptop with M3 Pro chip for demanding workflows',
    price: 2399.99,
    originalPrice: 2499.99,
    category: 'electronics',
    subcategory: 'laptops',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop'
    ],
    keywords: ['laptop', 'apple', 'macbook', 'pro', 'computer', 'M3', 'professional'],
    rating: 4.9,
    reviewCount: 892,
    stock: 25,
    sizes: ['512GB SSD', '1TB SSD', '2TB SSD'],
    colors: ['Space Gray', 'Silver'],
    specifications: {
      display: '16.2" Liquid Retina XDR',
      processor: 'Apple M3 Pro chip',
      memory: '18GB unified memory',
      storage: '512GB SSD storage'
    },
    features: ['Touch ID', 'Magic Keyboard', 'Force Touch trackpad', '140W power adapter'],
    isOnSale: true,
    isFeatured: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling wireless headphones',
    price: 349.99,
    originalPrice: 399.99,
    category: 'electronics',
    subcategory: 'audio',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop'
    ],
    keywords: ['headphones', 'sony', 'wireless', 'noise canceling', 'audio', 'bluetooth'],
    rating: 4.6,
    reviewCount: 3241,
    stock: 75,
    sizes: ['One Size'],
    colors: ['Black', 'Silver'],
    specifications: {
      battery: '30 hours with ANC',
      connectivity: 'Bluetooth 5.2',
      drivers: '30mm dynamic drivers',
      weight: '250g'
    },
    features: ['Active Noise Canceling', 'Quick Charge', 'Multipoint connection', 'Touch controls'],
    isOnSale: true,
    isFeatured: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'Classic straight-leg jeans with the original design',
    price: 89.99,
    originalPrice: 98.00,
    category: 'clothing',
    subcategory: 'jeans',
    brand: 'Levi\'s',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop'
    ],
    keywords: ['jeans', 'levis', 'denim', 'clothing', 'pants', 'casual', 'classic'],
    rating: 4.4,
    reviewCount: 5623,
    stock: 120,
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    colors: ['Dark Blue', 'Light Blue', 'Black', 'Gray'],
    specifications: {
      material: '100% Cotton Denim',
      fit: 'Straight Leg',
      rise: 'Mid Rise',
      closure: 'Button Fly'
    },
    features: ['Original 501 design', 'Shrink-to-fit', 'Authentic details', 'Durable construction'],
    isOnSale: true,
    isFeatured: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function seedProducts() {
  console.log('🌱 Starting Firestore seeding...');
  
  try {
    const productsCollection = collection(db, 'products');
    
    for (const [index, product] of INITIAL_PRODUCTS.entries()) {
      console.log(`Adding product ${index + 1}/${INITIAL_PRODUCTS.length}: ${product.name}`);
      await addDoc(productsCollection, product);
    }
    
    console.log('✅ Successfully seeded Firestore with initial products');
    console.log(`📊 Added ${INITIAL_PRODUCTS.length} products to the database`);
    
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

async function seedSettings() {
  console.log('⚙️ Setting up store settings...');
  
  try {
    const settingsRef = doc(db, 'settings', 'store');
    await setDoc(settingsRef, {
      storeName: 'Aura AI VoiceShop',
      storeDescription: 'Your voice-powered shopping destination',
      currency: 'USD',
      shippingRates: {
        standard: 5.99,
        express: 12.99,
        overnight: 24.99
      },
      taxRate: 0.08,
      voiceSettings: {
        enabled: true,
        language: 'en-US',
        confidence: 0.7
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Store settings configured');
    
  } catch (error) {
    console.error('❌ Error setting up store settings:', error);
  }
}

async function main() {
  console.log('🔥 Aura AI VoiceShop - Firestore Seeding Tool');
  console.log('==============================================');
  console.log(`📍 Project: ${firebaseConfig.projectId}`);
  console.log('');
  
  await seedProducts();
  await seedSettings();
  
  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('You can now start your application and see the products.');
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
