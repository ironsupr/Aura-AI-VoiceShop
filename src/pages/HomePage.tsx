import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Smartphone, Laptop, Home, Gamepad2, Book, Baby } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const banners = [
    {
      id: 1,
      title: "Holiday Sale - Up to 70% Off",
      subtitle: "Shop the best deals of the season",
      image: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1200",
      cta: "Shop Now"
    },
    {
      id: 2,
      title: "New Electronics Collection",
      subtitle: "Latest gadgets and tech accessories",
      image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1200",
      cta: "Explore"
    },
    {
      id: 3,
      title: "Free Shipping on Orders $35+",
      subtitle: "Fast delivery to your doorstep",
      image: "https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=1200",
      cta: "Learn More"
    }
  ];

  const categories = [
    { name: 'Electronics', icon: Smartphone, color: 'bg-blue-100 text-blue-600' },
    { name: 'Computers', icon: Laptop, color: 'bg-purple-100 text-purple-600' },
    { name: 'Home & Garden', icon: Home, color: 'bg-green-100 text-green-600' },
    { name: 'Gaming', icon: Gamepad2, color: 'bg-red-100 text-red-600' },
    { name: 'Books', icon: Book, color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Baby & Kids', icon: Baby, color: 'bg-pink-100 text-pink-600' },
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
    <div className="min-h-screen">
      {/* Voice Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Voice Shopping!</h2>
            <p className="text-gray-600 mb-6">
              You can now shop using your voice! Try saying commands like:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                "Find wireless headphones"
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                "Show my cart"
              </li>
              <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                "Track my order"
              </li>
            </ul>
            <button
              onClick={handleOnboardingClose}
              className="w-full btn-primary"
            >
              Got it, let's shop!
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative h-96 overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
              transform: `translateX(${(index - currentSlide) * 100}%)`,
            }}
          >
            <div
              className="w-full h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url(${banner.image})` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                  <p className="text-xl md:text-2xl mb-8">{banner.subtitle}</p>
                  <button className="bg-accent text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
                    {banner.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.name}
                  to={`/products?category=${category.name.toLowerCase()}`}
                  className="group text-center"
                >
                  <div className={`w-20 h-20 mx-auto rounded-full ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/products" className="text-primary hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Voice Shopping CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Try Voice Shopping</h2>
          <p className="text-xl text-blue-100 mb-8">
            Shop hands-free with our voice assistant. Just click the mic and start talking!
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-blue-100">
            <span className="bg-blue-800 px-4 py-2 rounded-full">"Find laptops under $1000"</span>
            <span className="bg-blue-800 px-4 py-2 rounded-full">"Show me today's deals"</span>
            <span className="bg-blue-800 px-4 py-2 rounded-full">"Add to cart"</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;