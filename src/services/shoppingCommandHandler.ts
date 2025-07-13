// Shopping command handler service for voice interface
import { Command } from '../services/geminiIntentService';
import FirestoreService from './firestoreService';

// Keep some mock products for demo purposes (these would be in your Firestore in production)
export const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Apple iPhone 15 Pro Max',
    price: 1199.99,
    category: 'electronics',
    subcategory: 'smartphones',
    keywords: ['phone', 'apple', 'iphone', 'smartphone', 'mobile'],
    description: 'The latest iPhone with advanced camera and performance features',
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'p2',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    price: 349.99,
    category: 'electronics',
    subcategory: 'headphones',
    keywords: ['headphones', 'wireless', 'sony', 'noise cancelling', 'audio'],
    description: 'Premium noise cancelling wireless headphones with exceptional sound quality',
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'p3',
    name: 'MacBook Air M2',
    price: 1099.99,
    category: 'electronics',
    subcategory: 'laptops',
    keywords: ['laptop', 'macbook', 'apple', 'computer'],
    description: 'Ultra-thin and lightweight laptop with M2 chip',
    image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'p4',
    name: 'Samsung 55" QLED 4K Smart TV',
    price: 649.99,
    category: 'electronics',
    subcategory: 'televisions',
    keywords: ['tv', 'television', 'samsung', 'smart tv', '4k'],
    description: '55-inch QLED smart TV with 4K resolution',
    image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'p5',
    name: 'Bose QuietComfort Wireless Earbuds',
    price: 279.99,
    category: 'electronics',
    subcategory: 'headphones',
    keywords: ['earbuds', 'wireless', 'bose', 'headphones', 'noise cancelling'],
    description: 'Wireless earbuds with noise cancellation technology',
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'p6',
    name: 'Nike Air Max 270 Running Shoes',
    price: 150.00,
    category: 'fashion',
    subcategory: 'shoes',
    keywords: ['shoes', 'running', 'nike', 'sneakers'],
    description: 'Comfortable running shoes with air cushioning',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'p7',
    name: 'Instant Pot Duo 7-in-1 Pressure Cooker',
    price: 89.99,
    category: 'home',
    subcategory: 'kitchen',
    keywords: ['kitchen', 'cooker', 'pressure cooker', 'instant pot', 'appliance'],
    description: 'Multi-functional pressure cooker for quick and easy meals',
    image: 'https://images.pexels.com/photos/4057057/pexels-photo-4057057.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'p8',
    name: 'PlayStation 5 Console',
    price: 499.99,
    category: 'electronics',
    subcategory: 'gaming',
    keywords: ['gaming', 'playstation', 'ps5', 'console'],
    description: 'Next-generation gaming console with ultra-fast SSD',
    image: 'https://images.pexels.com/photos/13123599/pexels-photo-13123599.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export interface ShoppingCommandResult {
  success: boolean;
  message: string;
  data?: any;
  navigationAction?: {
    path: string;
    params?: Record<string, string>;
  };
  productsToShow?: typeof MOCK_PRODUCTS;
}

export class ShoppingCommandHandler {
  // Search products based on keywords, category, or product name
  static async searchProducts(query: string): Promise<ShoppingCommandResult> {
    if (!query || query.trim() === '') {
      return {
        success: false,
        message: "I couldn't understand what you'd like to search for. Please specify a product."
      };
    }

    try {
      // Use Firebase search
      const products = await FirestoreService.searchProducts(query, { limit: 20 });
      
      if (products.length === 0) {
        // Fallback to mock products for demo
        const normalizedQuery = query.toLowerCase().trim();
        const terms = normalizedQuery.split(' ');
        
        // Search mock products
        const matchingProducts = MOCK_PRODUCTS.filter(product => {
          // Check product name
          if (product.name.toLowerCase().includes(normalizedQuery)) {
            return true;
          }
          
          // Check category
          if (product.category.toLowerCase().includes(normalizedQuery)) {
            return true;
          }
          
          // Check subcategory
          if (product.subcategory.toLowerCase().includes(normalizedQuery)) {
            return true;
          }
          
          // Check keywords
          if (product.keywords.some(keyword => 
            terms.some(term => keyword.includes(term))
          )) {
            return true;
          }
          
          // Check description
          if (product.description.toLowerCase().includes(normalizedQuery)) {
            return true;
          }
          
          return false;
        });

        if (matchingProducts.length === 0) {
          return {
            success: false,
            message: `I couldn't find any products matching "${query}". Would you like to try a different search?`,
            productsToShow: []
          };
        }

        return {
          success: true,
          message: `I found ${matchingProducts.length} products matching "${query}".`,
          data: { query, results: matchingProducts },
          navigationAction: {
            path: '/products',
            params: { search: query }
          },
          productsToShow: matchingProducts
        };
      }

      return {
        success: true,
        message: `I found ${products.length} products matching "${query}".`,
        data: { query, results: products },
        navigationAction: {
          path: '/products',
          params: { search: query }
        },
        productsToShow: products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          subcategory: p.subcategory,
          keywords: p.keywords,
          description: p.description,
          image: p.images?.[0] || 'https://via.placeholder.com/300x300'
        }))
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error while searching. Please try again.',
        productsToShow: []
      };
    }
  }

  // Add a product to the cart
  static addToCart(productId: string, quantity: number = 1): ShoppingCommandResult {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    
    if (!product) {
      return {
        success: false,
        message: "I couldn't find that product. Please try again with a different product."
      };
    }
    
    // In a real app, you would use CartContext to add to cart
    // For demo purposes, we'll just return a success message
    return {
      success: true,
      message: `Added ${product.name} to your cart.`,
      data: { product, quantity }
    };
  }

  // Remove a product from cart
  static removeFromCart(productId: string): ShoppingCommandResult {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    
    if (!product) {
      return {
        success: false,
        message: "I couldn't find that product in your cart."
      };
    }
    
    return {
      success: true,
      message: `Removed ${product.name} from your cart.`,
      data: { productId }
    };
  }

  // Navigate to cart
  static viewCart(): ShoppingCommandResult {
    return {
      success: true,
      message: "Here's your shopping cart.",
      navigationAction: {
        path: '/cart'
      }
    };
  }

  // Navigate to category
  static browseCategory(category: string): ShoppingCommandResult {
    const normalizedCategory = category.toLowerCase().trim();
    const availableCategories = [...new Set(MOCK_PRODUCTS.map(p => p.category))];
    
    if (!availableCategories.includes(normalizedCategory)) {
      return {
        success: false,
        message: `I couldn't find the category "${category}". Available categories are: ${availableCategories.join(', ')}.`
      };
    }
    
    const categoryProducts = MOCK_PRODUCTS.filter(p => 
      p.category.toLowerCase() === normalizedCategory
    );
    
    return {
      success: true,
      message: `Showing products in the ${category} category.`,
      navigationAction: {
        path: '/products',
        params: { category: normalizedCategory }
      },
      productsToShow: categoryProducts
    };
  }

  // Process product details
  static viewProductDetails(productId: string): ShoppingCommandResult {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    
    if (!product) {
      return {
        success: false,
        message: "I couldn't find that product. Please try again with a different product."
      };
    }
    
    return {
      success: true,
      message: `Here's the ${product.name}.`,
      navigationAction: {
        path: `/product/${productId}`
      },
      data: { product }
    };
  }

  // Process checkout command
  static checkout(): ShoppingCommandResult {
    return {
      success: true,
      message: "Taking you to checkout.",
      navigationAction: {
        path: '/checkout'
      }
    };
  }

  // Handle general shopping command
  static async handleShoppingCommand(command: Command): Promise<ShoppingCommandResult> {
    switch (command.action) {
      case 'search_products':
        return await this.searchProducts(command.parameters.query || '');
        
      case 'add_to_cart':
        return this.addToCart(
          command.parameters.productId || '',
          command.parameters.quantity || 1
        );
        
      case 'remove_from_cart':
        return this.removeFromCart(command.parameters.productId || '');
        
      case 'view_cart':
        return this.viewCart();
        
      case 'browse_category':
        return this.browseCategory(command.parameters.category || '');
        
      case 'view_product':
        return this.viewProductDetails(command.parameters.productId || '');
        
      case 'checkout':
        return this.checkout();
        
      default:
        return {
          success: false,
          message: "I'm not sure how to handle that shopping request."
        };
    }
  }
}

export default ShoppingCommandHandler;
