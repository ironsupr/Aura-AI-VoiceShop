// Firestore database service for products, users, and orders
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

// Type definitions
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  brand: string;
  images: string[];
  keywords: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  sizes?: string[];
  colors?: string[];
  specifications?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: {
    favoriteCategories: string[];
    voiceEnabled: boolean;
    notifications: boolean;
  };
  addresses: Address[];
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  trackingNumber?: string;
}

export interface VoiceSession {
  id: string;
  userId: string;
  transcript: string;
  intent: string;
  confidence: number;
  commands: any[];
  successful: boolean;
  createdAt: Timestamp;
}

export class FirestoreService {
  // Products
  static async getProducts(options: {
    category?: string;
    limit?: number;
    lastDoc?: any;
    searchQuery?: string;
    sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ products: Product[], lastDoc: any }> {
    try {
      const productsRef = collection(db, 'products');
      let q = query(productsRef, where('isActive', '==', true));

      // Apply filters
      if (options.category) {
        q = query(q, where('category', '==', options.category));
      }

      // Apply sorting
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder || 'desc';
      q = query(q, orderBy(sortBy, sortOrder));

      // Apply pagination
      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));

      // Handle search query (client-side filtering for simplicity)
      let filteredProducts = products;
      if (options.searchQuery) {
        const searchTerm = options.searchQuery.toLowerCase();
        filteredProducts = products.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
          product.category.toLowerCase().includes(searchTerm)
        );
      }

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      return { products: filteredProducts, lastDoc };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  static async getProduct(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  static async searchProducts(searchQuery: string, options: {
    category?: string;
    limit?: number;
  } = {}): Promise<Product[]> {
    try {
      // For now, we'll use the getProducts method with search filtering
      // In production, you might want to use Algolia or implement full-text search
      const { products } = await this.getProducts({
        searchQuery,
        category: options.category,
        limit: options.limit || 20
      });
      
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  // Users
  static async createUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  // Cart management (user-specific)
  static async getCart(userId: string): Promise<CartItem[]> {
    try {
      const cartRef = collection(db, 'users', userId, 'cart');
      const snapshot = await getDocs(cartRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as unknown as CartItem));
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw new Error('Failed to fetch cart');
    }
  }

  static async addToCart(userId: string, item: Omit<CartItem, 'id'>): Promise<string> {
    try {
      const cartRef = collection(db, 'users', userId, 'cart');
      
      // Check if item already exists in cart
      const existingItemQuery = query(
        cartRef, 
        where('productId', '==', item.productId),
        where('size', '==', item.size || null),
        where('color', '==', item.color || null)
      );
      const existingItems = await getDocs(existingItemQuery);

      if (!existingItems.empty) {
        // Update quantity of existing item
        const existingDoc = existingItems.docs[0];
        await updateDoc(existingDoc.ref, {
          quantity: increment(item.quantity)
        });
        return existingDoc.id;
      } else {
        // Add new item
        const docRef = await addDoc(cartRef, {
          ...item,
          addedAt: Timestamp.now()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw new Error('Failed to add item to cart');
    }
  }

  static async updateCartItem(userId: string, itemId: string, updates: Partial<CartItem>): Promise<void> {
    try {
      const itemRef = doc(db, 'users', userId, 'cart', itemId);
      await updateDoc(itemRef, updates);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw new Error('Failed to update cart item');
    }
  }

  static async removeFromCart(userId: string, itemId: string): Promise<void> {
    try {
      const itemRef = doc(db, 'users', userId, 'cart', itemId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error('Failed to remove item from cart');
    }
  }

  static async clearCart(userId: string): Promise<void> {
    try {
      const cartRef = collection(db, 'users', userId, 'cart');
      const snapshot = await getDocs(cartRef);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  }

  // Orders
  static async createOrder(userId: string, orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const ordersRef = collection(db, 'orders');
      const docRef = await addDoc(ordersRef, {
        ...orderData,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      // Clear user's cart after order creation
      await this.clearCart(userId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  static async getOrders(userId: string): Promise<Order[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Voice session analytics
  static async logVoiceSession(sessionData: Omit<VoiceSession, 'id' | 'createdAt'>): Promise<string> {
    try {
      const sessionsRef = collection(db, 'voiceSessions');
      const docRef = await addDoc(sessionsRef, {
        ...sessionData,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error logging voice session:', error);
      throw new Error('Failed to log voice session');
    }
  }

  // Real-time subscriptions
  static subscribeToCart(userId: string, callback: (items: CartItem[]) => void): () => void {
    const cartRef = collection(db, 'users', userId, 'cart');
    
    return onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as unknown as CartItem));
      callback(items);
    });
  }

  static subscribeToOrder(orderId: string, callback: (order: Order | null) => void): () => void {
    const orderRef = doc(db, 'orders', orderId);
    
    return onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Order);
      } else {
        callback(null);
      }
    });
  }
}

export default FirestoreService;
