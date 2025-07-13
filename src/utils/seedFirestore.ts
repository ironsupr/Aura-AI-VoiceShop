// Firebase data seeding script
// Run this script to populate your Firestore database with initial product data

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export const INITIAL_PRODUCTS = [
  {
    name: 'Apple iPhone 15 Pro Max',
    description: 'The latest iPhone with advanced camera and performance features',
    price: 1199.99,
    originalPrice: 1299.99,
    category: 'electronics',
    subcategory: 'smartphones',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop'
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
      battery: 'Up to 29 hours video playback',
      storage: '128GB to 1TB'
    },
    isActive: true
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Premium noise cancelling wireless headphones with exceptional sound quality',
    price: 349.99,
    originalPrice: 399.99,
    category: 'electronics',
    subcategory: 'headphones',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop'
    ],
    keywords: ['headphones', 'wireless', 'sony', 'noise cancelling', 'audio', 'bluetooth'],
    rating: 4.6,
    reviewCount: 1832,
    stock: 25,
    colors: ['Black', 'Silver'],
    specifications: {
      driver: '30mm',
      frequency: '4 Hz-40,000 Hz',
      battery: 'Up to 30 hours',
      weight: '250g',
      connectivity: 'Bluetooth 5.2'
    },
    isActive: true
  },
  {
    name: 'MacBook Air M2',
    description: 'Ultra-thin and lightweight laptop with M2 chip for incredible performance',
    price: 1099.99,
    category: 'electronics',
    subcategory: 'laptops',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop'
    ],
    keywords: ['laptop', 'macbook', 'apple', 'computer', 'M2', 'ultrabook'],
    rating: 4.7,
    reviewCount: 923,
    stock: 15,
    sizes: ['256GB', '512GB', '1TB', '2TB'],
    colors: ['Space Gray', 'Silver', 'Gold', 'Starlight'],
    specifications: {
      processor: 'Apple M2 chip',
      display: '13.6" Liquid Retina',
      memory: '8GB unified memory',
      storage: '256GB SSD',
      battery: 'Up to 18 hours'
    },
    isActive: true
  },
  {
    name: 'Samsung 55" QLED 4K Smart TV',
    description: '55-inch QLED smart TV with 4K resolution and HDR support',
    price: 649.99,
    originalPrice: 799.99,
    category: 'electronics',
    subcategory: 'televisions',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop'
    ],
    keywords: ['tv', 'television', 'samsung', 'smart tv', '4k', 'qled', 'hdr'],
    rating: 4.4,
    reviewCount: 567,
    stock: 8,
    sizes: ['55"'],
    specifications: {
      resolution: '4K Ultra HD (3840 x 2160)',
      display: 'QLED',
      smartPlatform: 'Tizen OS',
      hdr: 'HDR10+',
      sound: '20W speakers'
    },
    isActive: true
  },
  {
    name: 'Bose QuietComfort Wireless Earbuds',
    description: 'Premium wireless earbuds with world-class noise cancellation',
    price: 279.99,
    category: 'electronics',
    subcategory: 'earbuds',
    brand: 'Bose',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop'
    ],
    keywords: ['earbuds', 'wireless', 'bose', 'noise cancelling', 'bluetooth'],
    rating: 4.5,
    reviewCount: 1243,
    stock: 35,
    colors: ['Black', 'White'],
    specifications: {
      battery: 'Up to 6 hours + 12 hours with case',
      connectivity: 'Bluetooth 5.1',
      waterResistance: 'IPX4',
      features: 'Active Noise Cancellation'
    },
    isActive: true
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt available in various colors',
    price: 29.99,
    category: 'clothing',
    subcategory: 'shirts',
    brand: 'EcoWear',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop'
    ],
    keywords: ['t-shirt', 'organic', 'cotton', 'clothing', 'casual', 'eco-friendly'],
    rating: 4.3,
    reviewCount: 789,
    stock: 100,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Navy', 'Gray', 'Green', 'Blue'],
    specifications: {
      material: '100% Organic Cotton',
      fit: 'Regular fit',
      care: 'Machine washable',
      origin: 'Made in USA'
    },
    isActive: true
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Comfortable ergonomic chair designed for long work sessions',
    price: 399.99,
    originalPrice: 499.99,
    category: 'furniture',
    subcategory: 'chairs',
    brand: 'WorkPro',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop'
    ],
    keywords: ['chair', 'office', 'ergonomic', 'furniture', 'work', 'comfortable'],
    rating: 4.2,
    reviewCount: 432,
    stock: 12,
    colors: ['Black', 'Gray', 'White'],
    specifications: {
      material: 'Mesh back, fabric seat',
      adjustability: 'Height, armrest, lumbar support',
      weightCapacity: '300 lbs',
      warranty: '5 years'
    },
    isActive: true
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle that keeps drinks cold for 24 hours',
    price: 24.99,
    category: 'accessories',
    subcategory: 'drinkware',
    brand: 'HydroFlask',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop'
    ],
    keywords: ['water bottle', 'insulated', 'stainless steel', 'hydration', 'eco-friendly'],
    rating: 4.6,
    reviewCount: 1876,
    stock: 75,
    sizes: ['16oz', '20oz', '32oz', '40oz'],
    colors: ['Black', 'White', 'Blue', 'Green', 'Pink', 'Purple'],
    specifications: {
      material: '18/8 Stainless Steel',
      insulation: 'Double wall vacuum',
      coldRetention: '24 hours',
      hotRetention: '12 hours'
    },
    isActive: true
  }
];

export async function seedFirestoreData() {
  console.log('🌱 Starting Firestore data seeding...');
  
  try {
    const productsRef = collection(db, 'products');
    
    for (const product of INITIAL_PRODUCTS) {
      const productData = {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = await addDoc(productsRef, productData);
      console.log(`✅ Added product: ${product.name} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 Firestore seeding completed successfully!');
    console.log(`📦 Added ${INITIAL_PRODUCTS.length} products to the database.`);
    
  } catch (error) {
    console.error('❌ Error seeding Firestore data:', error);
    throw error;
  }
}

// Export individual functions for manual seeding
export async function addSingleProduct(productData: any) {
  try {
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true
    });
    
    console.log(`✅ Product added: ${productData.name} (ID: ${docRef.id})`);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding product:', error);
    throw error;
  }
}

// Call this function to seed your database
// Note: Only run this once when setting up your Firebase project
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Uncomment the line below to seed data (only run once!)
  // seedFirestoreData().catch(console.error);
}
