import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    description: 'Premium wireless headphones with noise cancellation',
    category: 'electronics',
    rating: 4.5,
    reviews: 128
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    description: 'Advanced fitness tracking with heart rate monitor',
    category: 'electronics',
    rating: 4.7,
    reviews: 89
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    description: 'Comfortable organic cotton t-shirt in various colors',
    category: 'clothing',
    rating: 4.3,
    reviews: 45
  },
  {
    id: '4',
    name: 'Professional Camera Lens',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=300&h=300&fit=crop',
    description: '85mm f/1.4 portrait lens for professional photography',
    category: 'electronics',
    rating: 4.9,
    reviews: 234
  },
  {
    id: '5',
    name: 'Ergonomic Office Chair',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
    description: 'Comfortable ergonomic chair for long work sessions',
    category: 'furniture',
    rating: 4.6,
    reviews: 67
  },
  {
    id: '6',
    name: 'Stainless Steel Water Bottle',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop',
    description: 'Insulated water bottle keeps drinks cold for 24 hours',
    category: 'accessories',
    rating: 4.4,
    reviews: 156
  },
  {
    id: '7',
    name: 'Leather Messenger Bag',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
    description: 'Genuine leather messenger bag for work and travel',
    category: 'accessories',
    rating: 4.2,
    reviews: 78
  },
  {
    id: '8',
    name: 'Wireless Phone Charger',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1609592842063-f7cd5ac0c3e8?w=300&h=300&fit=crop',
    description: 'Fast wireless charging pad compatible with all phones',
    category: 'electronics',
    rating: 4.1,
    reviews: 203
  }
];

const ProductListingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      let filtered = mockProducts;

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Filter by category
      if (category && category !== 'all') {
        filtered = filtered.filter(product =>
          product.category.toLowerCase() === category.toLowerCase()
        );
      }

      setFilteredProducts(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, category]);

  const getPageTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    if (category && category !== 'all') {
      return `${category.charAt(0).toUpperCase() + category.slice(1)} Products`;
    }
    return 'All Products';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Results */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.071-2.33M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? `No products match your search "${searchQuery}"`
                  : 'No products available in this category'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListingPage;
