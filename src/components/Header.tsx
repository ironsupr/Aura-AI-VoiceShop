import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Mic, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useVoice } from '../context/VoiceContext';
import { useAuth } from '../context/AuthContext';
import VoiceSearchModal from './VoiceSearchModal';
import VoiceButtonGlobal from './VoiceButtonGlobal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { items } = useCart();
  const { isListening } = useVoice();
  const { user, signOut: logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys'
  ];

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchButtonClick = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-medium">Free shipping on orders over $50 | Voice shopping available!</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a5 5 0 1110 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>
      
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Aura
                </span>
                <span className="text-lg font-medium text-gray-700 ml-1">VoiceShop</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                  <span>Categories</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-2">
                    {categories.map((category, index) => (
                      <Link
                        key={category}
                        to={`/products?category=${category.toLowerCase()}`}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 rounded-lg transition-all duration-200"
                      >
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          index % 3 === 0 ? 'bg-purple-400' : 
                          index % 3 === 1 ? 'bg-blue-400' : 'bg-indigo-400'
                        }`}></div>
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-purple-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                All Products
              </Link>
              
              <Link 
                to="/deals" 
                className="text-gray-700 hover:text-purple-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 relative"
              >
                <span>Deals</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </Link>
            </div>

            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:flex items-center">
              <div className="relative flex-1 flex bg-gray-50 rounded-2xl border border-gray-200 hover:border-purple-300 focus-within:border-purple-500 focus-within:bg-white transition-all duration-300 shadow-sm hover:shadow-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anything..."
                  className="w-full pl-6 pr-4 py-4 bg-transparent border-0 focus:outline-none text-gray-700 placeholder-gray-500"
                  aria-label="Search products"
                />
                <div className="flex items-center pr-2">
                  <button 
                    type="button"
                    onClick={handleSearchButtonClick}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button 
                    onClick={() => setIsVoiceSearchOpen(true)}
                    className={`
                      p-2 flex items-center justify-center rounded-xl transition-all duration-300 group
                      ${isListening 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-md hover:shadow-lg'}
                    `}
                    aria-label="Search by voice"
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform duration-200`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search & Voice */}
              <div className="md:hidden flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200">
                  <Search className="w-5 h-5" />
                </button>
                <VoiceButtonGlobal 
                  onClick={() => setIsVoiceSearchOpen(true)} 
                  position="inline" 
                  size="sm"
                />
              </div>

              {/* Authentication */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName}
                        className="w-9 h-9 rounded-full ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all duration-200"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all duration-200">
                        <span className="text-white text-sm font-medium">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Account
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-slide-in-top">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full" />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 transition-all duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 transition-all duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 transition-all duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Wishlist
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={async () => {
                            await logout();
                            setShowUserMenu(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline font-medium">Sign In</span>
                </Link>
              )}

              {/* Enhanced Cart */}
              <Link 
                to="/cart" 
                className="relative group p-3 hover:bg-gray-50 rounded-xl transition-all duration-200"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-purple-600 transition-colors duration-200" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {cartItemCount > 0 ? `${cartItemCount} item${cartItemCount > 1 ? 's' : ''}` : 'Cart'}
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg">
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button 
                    onClick={handleSearchButtonClick}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-purple-600"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Mobile Categories */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category, index) => (
                      <Link
                        key={category}
                        to={`/products?category=${category.toLowerCase()}`}
                        className="flex items-center px-4 py-3 bg-gray-50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 text-gray-700 hover:text-purple-600 rounded-xl transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          index % 3 === 0 ? 'bg-purple-400' : 
                          index % 3 === 1 ? 'bg-blue-400' : 'bg-indigo-400'
                        }`}></div>
                        <span className="text-sm font-medium">{category}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Quick Links */}
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <Link
                    to="/products"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    All Products
                  </Link>
                  <Link
                    to="/deals"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Deals
                    <div className="ml-auto w-2 h-2 bg-red-500 rounded-full"></div>
                  </Link>
                </div>

                {/* Mobile User Section */}
                {user && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                        <p className="text-xs text-gray-500">Signed in</p>
                      </div>
                    </div>
                  </div>
                )}
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