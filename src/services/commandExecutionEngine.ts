// Command Validation and Execution Engine
import { Command, PageContext } from './geminiIntentService';
import ShoppingCommandHandler from './shoppingCommandHandler';

export interface CommandValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingParameters: string[];
  suggestedFixes: string[];
}

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
  requiresUserAction?: boolean;
  nextActions?: string[];
  navigationAction?: {
    path: string;
    params?: Record<string, string>;
  };
}

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export class CommandValidationEngine {
  static validateCommand(command: any, context: any): CommandValidationResult {
    const result: CommandValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingParameters: [],
      suggestedFixes: []
    };

    if (!command.action) {
      result.isValid = false;
      result.errors.push('Command action is required');
      return result;
    }

    switch (command.action) {
      case 'search':
        return this.validateSearchCommand(command, context, result);
      case 'add_to_cart':
        return this.validateAddToCartCommand(command, context, result);
      case 'navigate_to':
        return this.validateNavigationCommand(command, context, result);
      case 'apply_filter':
        return this.validateFilterCommand(command, context, result);
      case 'remove_from_cart':
        return this.validateRemoveFromCartCommand(command, context, result);
      case 'update_quantity':
        return this.validateUpdateQuantityCommand(command, context, result);
      default:
        result.warnings.push(`Unknown command action: ${command.action}`);
        return result;
    }
  }

  private static validateSearchCommand(command: any, _context: any, result: CommandValidationResult): CommandValidationResult {
    if (!command.parameters?.query || command.parameters.query.trim() === '') {
      result.isValid = false;
      result.errors.push('Search query is required');
      result.missingParameters.push('query');
      result.suggestedFixes.push('Please specify what you want to search for');
    }

    if (command.parameters?.query && command.parameters.query.length < 2) {
      result.warnings.push('Search query is very short, results may be limited');
    }

    return result;
  }

  private static validateAddToCartCommand(command: any, context: any, result: CommandValidationResult): CommandValidationResult {
    // If we're on a product page, we can add the current product
    if (context.currentPage === 'product_detail' && context.productId) {
      return result; // Valid - can add current product
    }

    // Otherwise, we need product specification
    if (!command.parameters?.productId && !command.parameters?.productName) {
      result.isValid = false;
      result.errors.push('Product identification required');
      result.missingParameters.push('productId or productName');
      result.suggestedFixes.push('Please specify which product to add or navigate to a product page first');
    }

    // Validate quantity if specified
    if (command.parameters?.quantity) {
      const qty = parseInt(command.parameters.quantity);
      if (isNaN(qty) || qty <= 0) {
        result.errors.push('Invalid quantity specified');
        result.suggestedFixes.push('Quantity must be a positive number');
      } else if (qty > 10) {
        result.warnings.push('Large quantity requested - please confirm');
      }
    }

    return result;
  }

  private static validateNavigationCommand(command: any, context: any, result: CommandValidationResult): CommandValidationResult {
    const validPages = ['home', 'cart', 'checkout', 'products', 'login', 'profile', 'orders'];
    
    if (!command.parameters?.page) {
      result.isValid = false;
      result.errors.push('Navigation target is required');
      result.missingParameters.push('page');
      result.suggestedFixes.push(`Please specify where to go: ${validPages.join(', ')}`);
    } else if (!validPages.includes(command.parameters.page)) {
      result.isValid = false;
      result.errors.push(`Invalid navigation target: ${command.parameters.page}`);
      result.suggestedFixes.push(`Valid pages are: ${validPages.join(', ')}`);
    }

    // Check if checkout navigation is valid
    if (command.parameters?.page === 'checkout' && (!context.cartItems || context.cartItems.length === 0)) {
      result.isValid = false;
      result.errors.push('Cannot proceed to checkout with empty cart');
      result.suggestedFixes.push('Please add items to your cart first');
    }

    return result;
  }

  private static validateFilterCommand(command: any, context: any, result: CommandValidationResult): CommandValidationResult {
    if (context.currentPage !== 'product_listing' && context.currentPage !== 'home') {
      result.warnings.push('Filters work best on product listing pages');
    }

    const validFilters = ['category', 'size', 'color', 'brand', 'price_range', 'rating'];
    const hasValidFilter = validFilters.some(filter => command.parameters?.[filter]);

    if (!hasValidFilter) {
      result.isValid = false;
      result.errors.push('At least one filter parameter is required');
      result.suggestedFixes.push(`Available filters: ${validFilters.join(', ')}`);
    }

    return result;
  }

  private static validateRemoveFromCartCommand(command: any, context: any, result: CommandValidationResult): CommandValidationResult {
    if (!context.cartItems || context.cartItems.length === 0) {
      result.isValid = false;
      result.errors.push('Cart is empty - nothing to remove');
      result.suggestedFixes.push('Add items to cart first');
      return result;
    }

    if (!command.parameters?.itemId && !command.parameters?.productName) {
      result.isValid = false;
      result.errors.push('Item identification required for removal');
      result.missingParameters.push('itemId or productName');
      result.suggestedFixes.push('Please specify which item to remove');
    }

    return result;
  }

  private static validateUpdateQuantityCommand(command: any, context: any, result: CommandValidationResult): CommandValidationResult {
    if (!context.cartItems || context.cartItems.length === 0) {
      result.isValid = false;
      result.errors.push('Cart is empty - no quantities to update');
      return result;
    }

    if (!command.parameters?.quantity) {
      result.isValid = false;
      result.errors.push('New quantity is required');
      result.missingParameters.push('quantity');
    } else {
      const qty = parseInt(command.parameters.quantity);
      if (isNaN(qty) || qty < 0) {
        result.errors.push('Invalid quantity - must be a non-negative number');
      }
    }

    if (!command.parameters?.itemId && !command.parameters?.productName) {
      result.isValid = false;
      result.errors.push('Item identification required');
      result.missingParameters.push('itemId or productName');
    }

    return result;
  }
}

export class CommandExecutionEngine {
  private static notificationCallbacks: Array<(notification: NotificationOptions) => void> = [];

  static registerNotificationCallback(callback: (notification: NotificationOptions) => void) {
    this.notificationCallbacks.push(callback);
  }

  static showNotification(options: NotificationOptions) {
    this.notificationCallbacks.forEach(callback => callback(options));
  }
  
  private static isShoppingCommand(action: string): boolean {
    const shoppingCommands = [
      'search_products',
      'add_to_cart',
      'remove_from_cart',
      'view_cart',
      'browse_category',
      'view_product',
      'checkout'
    ];
    
    return shoppingCommands.includes(action);
  }
  
  private static async executeHelpCommand(command: Command): Promise<ExecutionResult> {
    const helpTopic = command.parameters?.topic?.toLowerCase() || 'general';
    
    const helpMessages: Record<string, string> = {
      'general': 'I can help you shop, search for products, manage your cart, and more. Try saying "Search for headphones" or "Show my cart".',
      'search': 'You can search for products by saying "Search for [product]" or "Find [product]".',
      'cart': 'To manage your cart, try "Add [product] to cart", "Remove [product] from cart", or "Show my cart".',
      'checkout': 'To check out, say "Checkout" or "Complete my purchase".',
      'navigation': 'You can navigate by saying "Go to [page]" like "Go to home" or "Go to products".'
    };
    
    const message = helpMessages[helpTopic] || helpMessages.general;
    
    return {
      success: true,
      message,
      nextActions: ['search products', 'view cart', 'browse categories']
    };
  }

  static async executeCommand(command: Command, context: PageContext): Promise<ExecutionResult> {
    try {
      // Check for shopping-specific commands first
      if (this.isShoppingCommand(command.action)) {
        const result = await ShoppingCommandHandler.handleShoppingCommand(command);
        
        // Handle navigation if needed
        if (result.navigationAction) {
          if (result.navigationAction.path) {
            // Build URL with params if they exist
            let url = result.navigationAction.path;
            if (result.navigationAction.params) {
              const params = new URLSearchParams();
              Object.entries(result.navigationAction.params).forEach(([key, value]) => {
                // Ensure value is converted to string safely
                const stringValue = typeof value === 'string' ? value : String(value);
                params.append(key, stringValue);
              });
              url += `?${params.toString()}`;
            }
            
            // Navigate
            window.location.href = url;
          }
        }
        
        // Show notification with results
        if (result.success) {
          this.showNotification({
            type: 'success',
            title: 'Shopping Action',
            message: result.message,
            duration: 3000
          });
        } else {
          this.showNotification({
            type: 'warning',
            title: 'Shopping Action',
            message: result.message,
            duration: 3000
          });
        }
        
        // Convert shopping result to execution result
        return {
          success: result.success,
          message: result.message,
          data: result.data,
          // If failed, suggest basic shopping commands
          nextActions: !result.success ? ['search products', 'view cart', 'browse categories'] : undefined
        };
      }
      
      // For non-shopping commands, validate command first
      const validation = CommandValidationEngine.validateCommand(command, context);
      
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join('; '),
          errors: validation.errors,
          nextActions: validation.suggestedFixes
        };
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
        this.showNotification({
          type: 'warning',
          title: 'Command Warning',
          message: validation.warnings.join('; '),
          duration: 3000
        });
      }

      // Execute non-shopping commands
      switch (command.action) {
        case 'search':
          return await this.executeSearchCommand(command, context);
        case 'add_to_cart':
          return await this.executeAddToCartCommand(command, context);
        case 'navigate_to':
        case 'navigate':
          return await this.executeNavigationCommand(command, context);
        case 'apply_filter':
          return await this.executeFilterCommand(command, context);
        case 'remove_from_cart':
          return await this.executeRemoveFromCartCommand(command, context);
        case 'update_quantity':
          return await this.executeUpdateQuantityCommand(command, context);
        case 'show_cart':
        case 'view_cart':
          return await this.executeShowCartCommand(command, context);
        case 'help':
          return await this.executeHelpCommand(command);
        case 'repeat':
          return {
            success: true,
            message: "I'll repeat that for you.",
            data: { repeat: true }
          };
        case 'stop':
        case 'cancel':
          return {
            success: true,
            message: "Ok, I'll stop.",
            data: { stop: true }
          };
        default:
          return {
            success: false,
            message: `Unknown command: ${command.action}`,
            nextActions: ['Try a different command', 'Ask for help']
          };
      }
    } catch (error) {
      console.error('Command execution error:', error);
      return {
        success: false,
        message: 'An error occurred while executing the command',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private static async executeSearchCommand(command: any, _context: any): Promise<ExecutionResult> {
    const query = command.parameters.query;
    const category = command.parameters.category;
    
    // Build search URL
    const searchParams = new URLSearchParams();
    searchParams.set('search', String(query));
    if (category) searchParams.set('category', String(category));
    
    const searchUrl = `/products?${searchParams.toString()}`;
    
    // Navigate to search results
    window.location.href = searchUrl;
    
    this.showNotification({
      type: 'info',
      title: 'Searching',
      message: `Searching for "${query}"${category ? ` in ${category}` : ''}`,
      duration: 2000
    });

    return {
      success: true,
      message: `Searching for "${query}"`,
      data: { query, category, url: searchUrl },
      nextActions: ['Apply filters', 'Sort results', 'Add items to cart']
    };
  }

  private static async executeAddToCartCommand(command: any, context: any): Promise<ExecutionResult> {
    try {
      // Get product information
      let productData;
      
      if (context.currentPage === 'product_detail' && context.productId) {
        // Adding current product
        productData = {
          id: context.productId,
          name: context.productName,
          price: context.productPrice
        };
      } else if (command.parameters.productId || command.parameters.productName) {
        // Adding specified product (would need to fetch product data)
        productData = {
          id: command.parameters.productId,
          name: command.parameters.productName,
          price: command.parameters.price || 0
        };
      } else {
        return {
          success: false,
          message: 'Could not identify product to add',
          nextActions: ['Navigate to a product page', 'Specify product name']
        };
      }

      const quantity = parseInt(command.parameters.quantity || '1');
      const size = command.parameters.size;
      const color = command.parameters.color;

      // Simulate adding to cart (in real app, this would call cart API)
      const cartItem = {
        ...productData,
        quantity,
        size,
        color,
        addedAt: new Date()
      };

      // Update localStorage cart (demo implementation)
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      currentCart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(currentCart));

      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: currentCart }));

      this.showNotification({
        type: 'success',
        title: 'Added to Cart',
        message: `${productData.name} ${size ? `(${size})` : ''} ${color ? `in ${color}` : ''} added to cart`,
        duration: 3000,
        actions: [
          {
            label: 'View Cart',
            action: () => window.location.href = '/cart'
          }
        ]
      });

      return {
        success: true,
        message: `Added ${productData.name} to cart`,
        data: cartItem,
        nextActions: ['View cart', 'Continue shopping', 'Proceed to checkout']
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add item to cart',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private static async executeNavigationCommand(command: any, _context: any): Promise<ExecutionResult> {
    const page = command.parameters.page;
    
    const pageMap: Record<string, string> = {
      'home': '/',
      'cart': '/cart',
      'checkout': '/checkout',
      'products': '/products',
      'login': '/login',
      'profile': '/profile',
      'orders': '/orders'
    };
    
    const targetUrl = pageMap[page];
    if (!targetUrl) {
      return {
        success: false,
        message: `Unknown page: ${page}`,
        nextActions: ['Try a valid page name']
      };
    }

    // Navigate to the page
    window.location.href = targetUrl;

    this.showNotification({
      type: 'info',
      title: 'Navigating',
      message: `Going to ${page}`,
      duration: 2000
    });

    return {
      success: true,
      message: `Navigating to ${page}`,
      data: { page, url: targetUrl }
    };
  }

  private static async executeFilterCommand(command: any, _context: any): Promise<ExecutionResult> {
    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;
    
    // Apply filters to URL parameters with safe string conversion
    if (command.parameters.category) params.set('category', String(command.parameters.category));
    if (command.parameters.size) params.set('size', String(command.parameters.size));
    if (command.parameters.color) params.set('color', String(command.parameters.color));
    if (command.parameters.brand) params.set('brand', String(command.parameters.brand));
    if (command.parameters.price_range) params.set('price_range', String(command.parameters.price_range));
    if (command.parameters.rating) params.set('rating', String(command.parameters.rating));

    // Navigate to filtered URL
    window.location.href = currentUrl.toString();

    const appliedFilters = Object.entries(command.parameters)
      .filter(([key, value]) => value && key !== 'action')
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(', ');

    this.showNotification({
      type: 'success',
      title: 'Filters Applied',
      message: `Applied filters: ${appliedFilters}`,
      duration: 3000
    });

    return {
      success: true,
      message: `Applied filters: ${appliedFilters}`,
      data: command.parameters,
      nextActions: ['Clear filters', 'Apply additional filters', 'Sort results']
    };
  }

  private static async executeRemoveFromCartCommand(command: any, _context: any): Promise<ExecutionResult> {
    try {
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const itemId = command.parameters.itemId;
      const productName = command.parameters.productName;

      let removedItem: any = null;
      let updatedCart;

      if (itemId) {
        updatedCart = currentCart.filter((item: any, index: number) => {
          if (item.id === itemId || index.toString() === itemId) {
            removedItem = item;
            return false;
          }
          return true;
        });
      } else if (productName) {
        updatedCart = currentCart.filter((item: any) => {
          if (item.name.toLowerCase().includes(productName.toLowerCase())) {
            removedItem = item;
            return false;
          }
          return true;
        });
      }

      if (!removedItem) {
        return {
          success: false,
          message: 'Item not found in cart',
          nextActions: ['Check cart contents', 'Try a different item name']
        };
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }));

      this.showNotification({
        type: 'success',
        title: 'Item Removed',
        message: `${removedItem.name} removed from cart`,
        duration: 3000,
        actions: [
          {
            label: 'Undo',
            action: () => {
              const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
              currentCart.push(removedItem);
              localStorage.setItem('cart', JSON.stringify(currentCart));
              window.dispatchEvent(new CustomEvent('cartUpdated', { detail: currentCart }));
            }
          }
        ]
      });

      return {
        success: true,
        message: `Removed ${removedItem.name} from cart`,
        data: { removedItem, cartSize: updatedCart.length },
        nextActions: ['Continue shopping', 'View cart', 'Proceed to checkout']
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to remove item from cart',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private static async executeUpdateQuantityCommand(command: any, _context: any): Promise<ExecutionResult> {
    try {
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const newQuantity = parseInt(command.parameters.quantity);
      const itemId = command.parameters.itemId;
      const productName = command.parameters.productName;

      let updatedItem: any = null;
      const updatedCart = currentCart.map((item: any, index: number) => {
        const isTargetItem = (itemId && (item.id === itemId || index.toString() === itemId)) ||
                            (productName && item.name.toLowerCase().includes(productName.toLowerCase()));
        
        if (isTargetItem) {
          updatedItem = { ...item, quantity: newQuantity };
          return updatedItem;
        }
        return item;
      });

      if (!updatedItem) {
        return {
          success: false,
          message: 'Item not found in cart',
          nextActions: ['Check cart contents', 'Try a different item name']
        };
      }

      // Remove item if quantity is 0
      const finalCart = newQuantity === 0 
        ? updatedCart.filter((item: any) => item !== updatedItem)
        : updatedCart;

      localStorage.setItem('cart', JSON.stringify(finalCart));
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: finalCart }));

      const message = newQuantity === 0 
        ? `${updatedItem.name} removed from cart`
        : `${updatedItem.name} quantity updated to ${newQuantity}`;

      this.showNotification({
        type: 'success',
        title: 'Cart Updated',
        message,
        duration: 3000
      });

      return {
        success: true,
        message,
        data: { updatedItem, cartSize: finalCart.length },
        nextActions: ['Continue shopping', 'View cart', 'Proceed to checkout']
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update item quantity',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private static async executeShowCartCommand(_command: any, _context: any): Promise<ExecutionResult> {
    window.location.href = '/cart';

    this.showNotification({
      type: 'info',
      title: 'Opening Cart',
      message: 'Showing your shopping cart',
      duration: 2000
    });

    return {
      success: true,
      message: 'Opening shopping cart',
      nextActions: ['Update quantities', 'Remove items', 'Proceed to checkout']
    };
  }
}

export default { CommandValidationEngine, CommandExecutionEngine };
