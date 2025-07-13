import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import FirestoreService, { CartItem } from '../services/firestoreService';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  total: number;
  loading: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Get item count
  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  // Load cart when user changes
  useEffect(() => {
    if (user) {
      loadCart();
      
      // Subscribe to real-time cart updates
      const unsubscribe = FirestoreService.subscribeToCart(user.uid, (cartItems) => {
        setItems(cartItems);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // If no user, clear cart
      setItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const cartItems = await FirestoreService.getCart(user.uid);
      setItems(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<CartItem, 'id'>) => {
    if (!user) {
      throw new Error('Must be logged in to add items to cart');
    }

    setLoading(true);
    try {
      await FirestoreService.addToCart(user.uid, item);
      // Real-time subscription will update the items
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw new Error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!user) {
      throw new Error('Must be logged in to modify cart');
    }

    setLoading(true);
    try {
      await FirestoreService.removeFromCart(user.uid, itemId);
      // Real-time subscription will update the items
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw new Error('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user) {
      throw new Error('Must be logged in to modify cart');
    }

    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    setLoading(true);
    try {
      await FirestoreService.updateCartItem(user.uid, itemId, { quantity });
      // Real-time subscription will update the items
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw new Error('Failed to update item quantity');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) {
      throw new Error('Must be logged in to clear cart');
    }

    setLoading(true);
    try {
      await FirestoreService.clearCart(user.uid);
      // Real-time subscription will update the items
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const value: CartContextType = {
    items,
    total,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// For backward compatibility, also export the old interface
export interface LegacyCartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default CartContext;