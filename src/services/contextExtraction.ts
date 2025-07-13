// Context Extraction Service for Voice Shopping
export interface ProductContext {
  id?: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  availability?: string;
  sku?: string;
  category?: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  images?: string[];
  variants?: Array<{
    type: string;
    options: string[];
    selected?: string;
  }>;
}

export interface NavigationContext {
  currentPage: string;
  pageType: 'home' | 'product-listing' | 'product-detail' | 'cart' | 'checkout' | 'login' | 'search-results';
  url: string;
  previousPage?: string;
  searchQuery?: string;
  categoryFilter?: string;
  sortBy?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface UserContext {
  isLoggedIn: boolean;
  userId?: string;
  preferences?: {
    language?: string;
    currency?: string;
    preferredCategories?: string[];
    priceRange?: {
      min: number;
      max: number;
    };
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  paymentMethods?: Array<{
    type: 'credit' | 'debit' | 'paypal' | 'apple-pay';
    last4?: string;
    isDefault?: boolean;
  }>;
}

export interface SessionContext {
  sessionId: string;
  startTime: Date;
  conversationHistory: Array<{
    timestamp: Date;
    userInput: string;
    systemResponse: string;
    intent?: string;
    confidence?: number;
  }>;
  currentIntent?: string;
  extractedEntities?: Record<string, any>;
  pendingActions?: string[];
}

export interface CartContext {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    variant?: string;
    image?: string;
  }>;
  totalItems: number;
  subtotal: number;
  shipping?: number;
  tax?: number;
  total: number;
  appliedCoupons?: Array<{
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  }>;
}

export interface ComprehensiveContext {
  timestamp: Date;
  product: ProductContext;
  navigation: NavigationContext;
  user: UserContext;
  session: SessionContext;
  cart: CartContext;
  viewport: {
    width: number;
    height: number;
    isMobile: boolean;
  };
  browserInfo: {
    userAgent: string;
    language: string;
    timezone: string;
  };
}

class ContextExtractionService {
  private sessionData: SessionContext;

  constructor() {
    this.sessionData = {
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      conversationHistory: [],
    };
  }

  /**
   * Extract comprehensive context from current page state
   */
  extractComprehensiveContext(): ComprehensiveContext {
    return {
      timestamp: new Date(),
      product: this.extractProductContext(),
      navigation: this.extractNavigationContext(),
      user: this.extractUserContext(),
      session: this.sessionData,
      cart: this.extractCartContext(),
      viewport: this.extractViewportContext(),
      browserInfo: this.extractBrowserContext(),
    };
  }

  /**
   * Extract product information from current page
   */
  private extractProductContext(): ProductContext {
    const context: ProductContext = {};

    // Extract from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split('/');

    // Check if we're on a product detail page
    if (pathParts.includes('product') && pathParts.length > 2) {
      context.id = pathParts[pathParts.indexOf('product') + 1];
    }

    // Extract from DOM elements (common selectors)
    try {
      // Product name
      const nameSelectors = [
        '[data-testid="product-name"]',
        '.product-name',
        '.product-title',
        'h1[class*="product"]',
        '[itemprop="name"]'
      ];
      context.name = this.extractTextFromSelectors(nameSelectors);

      // Product price
      const priceSelectors = [
        '[data-testid="product-price"]',
        '.product-price',
        '.price-current',
        '[class*="price"]:not([class*="original"])',
        '[itemprop="price"]'
      ];
      const priceText = this.extractTextFromSelectors(priceSelectors);
      if (priceText) {
        context.price = this.parsePrice(priceText);
      }

      // Original price (for discounts)
      const originalPriceSelectors = [
        '[data-testid="original-price"]',
        '.original-price',
        '.price-original',
        '[class*="original"][class*="price"]'
      ];
      const originalPriceText = this.extractTextFromSelectors(originalPriceSelectors);
      if (originalPriceText) {
        context.originalPrice = this.parsePrice(originalPriceText);
      }

      // SKU
      const skuSelectors = [
        '[data-testid="product-sku"]',
        '.product-sku',
        '[class*="sku"]'
      ];
      context.sku = this.extractTextFromSelectors(skuSelectors);

      // Availability
      const availabilitySelectors = [
        '[data-testid="availability"]',
        '.availability',
        '.stock-status',
        '[class*="stock"]'
      ];
      context.availability = this.extractTextFromSelectors(availabilitySelectors);

      // Rating
      const ratingSelectors = [
        '[data-testid="rating"]',
        '.rating',
        '[class*="rating"]',
        '[itemprop="ratingValue"]'
      ];
      const ratingText = this.extractTextFromSelectors(ratingSelectors);
      if (ratingText) {
        const rating = parseFloat(ratingText.replace(/[^\d.]/g, ''));
        if (!isNaN(rating)) {
          context.rating = rating;
        }
      }

      // Reviews count
      const reviewsSelectors = [
        '[data-testid="reviews-count"]',
        '.reviews-count',
        '[class*="review"][class*="count"]'
      ];
      const reviewsText = this.extractTextFromSelectors(reviewsSelectors);
      if (reviewsText) {
        const reviews = parseInt(reviewsText.replace(/[^\d]/g, ''));
        if (!isNaN(reviews)) {
          context.reviews = reviews;
        }
      }

      // Category from breadcrumbs or navigation
      const categorySelectors = [
        '.breadcrumb a:last-child',
        '[data-testid="category"]',
        '.product-category'
      ];
      context.category = this.extractTextFromSelectors(categorySelectors);

    } catch (error) {
      console.warn('Error extracting product context:', error);
    }

    return context;
  }

  /**
   * Extract navigation and page context
   */
  private extractNavigationContext(): NavigationContext {
    const url = window.location.href;
    const pathname = window.location.pathname;
    const search = window.location.search;

    // Determine page type
    let pageType: NavigationContext['pageType'] = 'home';
    if (pathname.includes('/product/')) pageType = 'product-detail';
    else if (pathname.includes('/products')) pageType = 'product-listing';
    else if (pathname.includes('/cart')) pageType = 'cart';
    else if (pathname.includes('/checkout')) pageType = 'checkout';
    else if (pathname.includes('/login')) pageType = 'login';
    else if (search.includes('search') || search.includes('q=')) pageType = 'search-results';

    const context: NavigationContext = {
      currentPage: pathname,
      pageType,
      url,
      previousPage: document.referrer || undefined,
    };

    // Extract search query
    const urlParams = new URLSearchParams(search);
    context.searchQuery = urlParams.get('q') || urlParams.get('search') || undefined;
    context.categoryFilter = urlParams.get('category') || undefined;
    context.sortBy = urlParams.get('sort') || undefined;

    // Extract price range if present
    const minPrice = urlParams.get('min_price');
    const maxPrice = urlParams.get('max_price');
    if (minPrice || maxPrice) {
      context.priceRange = {
        min: minPrice ? parseFloat(minPrice) : 0,
        max: maxPrice ? parseFloat(maxPrice) : Infinity,
      };
    }

    return context;
  }

  /**
   * Extract user context (from localStorage, sessionStorage, or API)
   */
  private extractUserContext(): UserContext {
    const context: UserContext = {
      isLoggedIn: false,
    };

    try {
      // Check for authentication tokens
      const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');

      if (authToken) {
        context.isLoggedIn = true;
      }

      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        context.userId = parsed.id;
        context.preferences = parsed.preferences;
        context.shippingAddress = parsed.shippingAddress;
        context.paymentMethods = parsed.paymentMethods;
      }

      // Extract preferences from localStorage
      const preferences = localStorage.getItem('userPreferences');
      if (preferences) {
        context.preferences = { ...context.preferences, ...JSON.parse(preferences) };
      }

    } catch (error) {
      console.warn('Error extracting user context:', error);
    }

    return context;
  }

  /**
   * Extract cart context
   */
  private extractCartContext(): CartContext {
    const defaultCart: CartContext = {
      items: [],
      totalItems: 0,
      subtotal: 0,
      total: 0,
    };

    try {
      // Try to get cart from localStorage or global state
      const cartData = localStorage.getItem('cart') || sessionStorage.getItem('cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        return {
          items: cart.items || [],
          totalItems: cart.totalItems || cart.items?.length || 0,
          subtotal: cart.subtotal || 0,
          shipping: cart.shipping,
          tax: cart.tax,
          total: cart.total || cart.subtotal || 0,
          appliedCoupons: cart.appliedCoupons,
        };
      }

      // Try to extract from DOM
      const cartCountSelector = '[data-testid="cart-count"], .cart-count, [class*="cart"][class*="count"]';
      const cartCountElement = document.querySelector(cartCountSelector);
      if (cartCountElement) {
        const count = parseInt(cartCountElement.textContent || '0');
        if (!isNaN(count)) {
          defaultCart.totalItems = count;
        }
      }

    } catch (error) {
      console.warn('Error extracting cart context:', error);
    }

    return defaultCart;
  }

  /**
   * Extract viewport context
   */
  private extractViewportContext() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768,
    };
  }

  /**
   * Extract browser context
   */
  private extractBrowserContext() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  /**
   * Add conversation entry to session history
   */
  addConversationEntry(userInput: string, systemResponse: string, intent?: string, confidence?: number) {
    this.sessionData.conversationHistory.push({
      timestamp: new Date(),
      userInput,
      systemResponse,
      intent,
      confidence,
    });

    // Keep only last 10 entries to prevent memory issues
    if (this.sessionData.conversationHistory.length > 10) {
      this.sessionData.conversationHistory = this.sessionData.conversationHistory.slice(-10);
    }
  }

  /**
   * Helper method to extract text from multiple selectors
   */
  private extractTextFromSelectors(selectors: string[]): string | undefined {
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          return element.textContent.trim();
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    return undefined;
  }

  /**
   * Helper method to parse price from text
   */
  private parsePrice(priceText: string): number | undefined {
    const cleaned = priceText.replace(/[^\d.,]/g, '');
    const price = parseFloat(cleaned.replace(/,/g, ''));
    return isNaN(price) ? undefined : price;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session data
   */
  getSessionData(): SessionContext {
    return this.sessionData;
  }

  /**
   * Update current intent
   */
  updateCurrentIntent(intent: string, entities?: Record<string, any>) {
    this.sessionData.currentIntent = intent;
    if (entities) {
      this.sessionData.extractedEntities = { ...this.sessionData.extractedEntities, ...entities };
    }
  }
}

export default ContextExtractionService;
