import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Smartphone, Laptop, Home, Gamepad2, Book, Baby, Mic, Star, ArrowRight, Sparkles, Play } from 'lucide-react';
import ProductCard from '../components/ProductCard';
// import { useVoice } from '../context/VoiceContext';

const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Voice context available but not used in this component currently
  // const { isListening } = useVoice();

  const banners = [
    {
      id: 1,
      title: "Experience AI-Powered Shopping",
      subtitle: "Shop smarter with Aura's intelligent voice assistant",
      image: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1200",
      cta: "Try Voice Shopping",
      accent: "from-purple-600 to-blue-600",
      description: "Discover products with just your voice"
    },
    {
      id: 2,
      title: "Next-Gen Electronics Collection",
      subtitle: "Discover cutting-edge technology and innovation",
      image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1200",
      cta: "Explore Tech",
      accent: "from-blue-600 to-cyan-600",
      description: "Latest gadgets with AI recommendations"
    },
    {
      id: 3,
      title: "Instant AI Assistance",
      subtitle: "Get personalized recommendations in real-time",
      image: "https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=1200",
      cta: "Learn More",
      accent: "from-cyan-600 to-teal-600",
      description: "AI that understands your preferences"
    }
  ];

  const categories = [
    { name: 'Electronics', icon: Smartphone, color: 'bg-gradient-to-br from-blue-50 to-blue-100', iconColor: 'text-blue-600', hoverColor: 'hover:from-blue-100 hover:to-blue-200' },
    { name: 'Computers', icon: Laptop, color: 'bg-gradient-to-br from-purple-50 to-purple-100', iconColor: 'text-purple-600', hoverColor: 'hover:from-purple-100 hover:to-purple-200' },
    { name: 'Home & Garden', icon: Home, color: 'bg-gradient-to-br from-emerald-50 to-emerald-100', iconColor: 'text-emerald-600', hoverColor: 'hover:from-emerald-100 hover:to-emerald-200' },
    { name: 'Gaming', icon: Gamepad2, color: 'bg-gradient-to-br from-red-50 to-red-100', iconColor: 'text-red-600', hoverColor: 'hover:from-red-100 hover:to-red-200' },
    { name: 'Books', icon: Book, color: 'bg-gradient-to-br from-amber-50 to-amber-100', iconColor: 'text-amber-600', hoverColor: 'hover:from-amber-100 hover:to-amber-200' },
    { name: 'Baby & Kids', icon: Baby, color: 'bg-gradient-to-br from-pink-50 to-pink-100', iconColor: 'text-pink-600', hoverColor: 'hover:from-pink-100 hover:to-pink-200' },
  ];

  const featuredProducts = [
    {
      id: '1',
      name: 'Apple iPhone 15 Pro Max',
      price: 1199.99,
      originalPrice: 1299.99,
      rating: 4.8,
      reviews: 2847,
      image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
      badge: 'Best Seller'
    },
    {
      id: '2',
      name: 'Sony WH-1000XM5 Wireless Headphones',
      price: 349.99,
      originalPrice: 399.99,
      rating: 4.7,
      reviews: 1523,
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      name: 'MacBook Air M2',
      price: 1099.99,
      originalPrice: 1199.99,
      rating: 4.9,
      reviews: 892,
      image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '4',
      name: 'Samsung 55" 4K Smart TV',
      price: 649.99,
      originalPrice: 799.99,
      rating: 4.6,
      reviews: 1247,
      image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('voiceOnboardingSeen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    localStorage.setItem('voiceOnboardingSeen', 'true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-gradient-to-l from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
      {/* Voice Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-white/20 transform animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome to Aura!
              </h2>
              <p className="text-gray-600 text-lg">
                Experience the future of voice-powered shopping
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-700 font-medium">Try these voice commands:</p>
              {[
                { icon: "🎧", text: "Find wireless headphones" },
                { icon: "🛒", text: "Show my cart" },
                { icon: "📦", text: "Track my order" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-gray-700 font-medium">"{item.text}"</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleOnboardingClose}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Shopping with Aura!
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative h-[500px] overflow-hidden rounded-b-3xl">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url(${banner.image})` }}
            >
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.accent} opacity-80`}></div>
              <div className="absolute inset-0 bg-black/20"></div>
              
              {/* Content */}
              <div className="relative z-10 flex items-center h-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl">
                    <div className="mb-4">
                      <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium">
                        <Sparkles className="w-4 h-4 mr-2" />
                        {banner.description}
                      </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                      {banner.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                      {banner.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="group bg-white text-gray-900 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
                        <span>{banner.cta}</span>
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center">
                        <Play className="w-5 h-5 mr-2" />
                        Watch Demo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-1/4 right-10 w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl animate-float-slow hidden lg:block"></div>
              <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl animate-float-slower hidden lg:block"></div>
            </div>
          </div>
        ))}
        
        {/* Enhanced Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl transition-all duration-300 flex items-center justify-center group border border-white/20"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-2xl transition-all duration-300 flex items-center justify-center group border border-white/20"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Enhanced Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide 
                  ? 'w-8 h-3 bg-white' 
                  : 'w-3 h-3 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div 
            className="h-full bg-gradient-to-r from-white to-white/80 transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / banners.length) * 100}%` }}
          ></div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 text-sm font-medium mb-4">
              <Star className="w-4 h-4 mr-2" />
              Popular Categories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing products across all categories with AI-powered recommendations
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.name}
                  to={`/products?category=${category.name.toLowerCase()}`}
                  className="group text-center transform hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-24 h-24 mx-auto ${category.color} ${category.hoverColor} flex items-center justify-center mb-4 rounded-3xl transition-all duration-300 shadow-lg group-hover:shadow-xl border border-white/50`}>
                    <IconComponent className={`w-10 h-10 ${category.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                    {category.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-16">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Trending Now
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600 mt-2">Handpicked by our AI for you</p>
            </div>
            <Link 
              to="/products" 
              className="group hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12 md:hidden">
            <Link 
              to="/products" 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span>View All Products</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Voice Shopping CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium mb-6">
              <Mic className="w-4 h-4 mr-2 animate-pulse" />
              AI-Powered Voice Shopping
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Shop with Your Voice
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the future of shopping with our intelligent voice assistant. 
              Just speak naturally and let AI handle the rest.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              {[
                { icon: "🎯", text: "Find laptops under $1000", desc: "Smart product search" },
                { icon: "📊", text: "Show me today's deals", desc: "Instant deal discovery" },
                { icon: "🛒", text: "Add to cart", desc: "Voice-controlled shopping" }
              ].map((item, index) => (
                <div key={index} className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-white font-medium mb-2 text-sm">
                    "{item.text}"
                  </div>
                  <p className="text-blue-100 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center">
                <Mic className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Try Voice Shopping Now
              </button>
              <button className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Watch How It Works
              </button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default HomePage;