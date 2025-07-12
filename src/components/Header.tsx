import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Mic } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import VoiceSearchModal from './VoiceSearchModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const { items } = useCart();
  const { isListening } = useVoice();

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys'
  ];

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ShopMart</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className="relative group">
                <button className="text-gray-700 hover:text-primary font-medium">
                  Categories
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={`/products?category=${category.toLowerCase()}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products... (or click mic to speak)"
                  className="w-full pl-4 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  aria-label="Search products"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button
                    onClick={() => setIsVoiceSearchOpen(true)}
                    className={`p-1.5 rounded-full transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-100 text-red-600 animate-listening' 
                        : 'text-gray-400 hover:text-primary hover:bg-gray-100'
                    }`}
                    aria-label="Voice search"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search */}
              <button className="md:hidden p-2 text-gray-600 hover:text-primary">
                <Search className="w-5 h-5" />
              </button>

              {/* Login */}
              <Link to="/login" className="hidden sm:flex items-center space-x-1 text-gray-700 hover:text-primary">
                <User className="w-5 h-5" />
                <span className="hidden lg:inline">Sign In</span>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-primary"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={`/products?category=${category.toLowerCase()}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <VoiceSearchModal 
        isOpen={isVoiceSearchOpen} 
        onClose={() => setIsVoiceSearchOpen(false)} 
      />
    </>
  );
};

export default Header;