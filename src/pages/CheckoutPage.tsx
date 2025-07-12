import React, { useState } from 'react';
import { CreditCard, MapPin, Truck, Mic } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CheckoutPage: React.FC = () => {
  const { items, total } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState(0);

  const addresses = [
    {
      id: 1,
      name: 'John Doe',
      address: '123 Main St, Apt 4B',
      city: 'New York, NY 10001',
      phone: '(555) 123-4567',
      isDefault: true
    },
    {
      id: 2,
      name: 'John Doe',
      address: '456 Oak Avenue',
      city: 'Brooklyn, NY 11201',
      phone: '(555) 123-4567',
      isDefault: false
    }
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'Credit Card',
      details: '**** **** **** 1234',
      brand: 'Visa',
      isDefault: true
    },
    {
      id: 2,
      type: 'PayPal',
      details: 'john.doe@email.com',
      brand: 'PayPal',
      isDefault: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Voice Commands */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 text-blue-700">
          <Mic className="w-5 h-5" />
          <span className="font-medium">Voice Commands:</span>
          <span className="text-blue-600">Say "Select UPI" or "Proceed to Pay" to navigate checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
            </div>
            
            <div className="space-y-4">
              {addresses.map((address, index) => (
                <label key={address.id} className="block">
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedAddress === index 
                      ? 'border-primary bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === index}
                        onChange={() => setSelectedAddress(index)}
                        className="mt-1 text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{address.name}</span>
                          {address.isDefault && (
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{address.address}</p>
                        <p className="text-gray-600">{address.city}</p>
                        <p className="text-gray-600">{address.phone}</p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
              
              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
                + Add New Address
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
            </div>
            
            <div className="space-y-4">
              {paymentMethods.map((payment, index) => (
                <label key={payment.id} className="block">
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedPayment === index 
                      ? 'border-primary bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={selectedPayment === index}
                        onChange={() => setSelectedPayment(index)}
                        className="text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{payment.type}</span>
                          <span className="text-sm text-gray-500">{payment.brand}</span>
                          {payment.isDefault && (
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{payment.details}</p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
              
              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
                + Add New Payment Method
              </button>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Delivery Options</h2>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="delivery" defaultChecked className="text-primary focus:ring-primary" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Standard Delivery</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <p className="text-sm text-gray-600">Arrives tomorrow, Dec 15</p>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="delivery" className="text-primary focus:ring-primary" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Express Delivery</span>
                    <span className="font-medium text-gray-900">$9.99</span>
                  </div>
                  <p className="text-sm text-gray-600">Arrives today by 6 PM</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${(total * 0.08).toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${(total + total * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full btn-primary py-3 mb-4">
              Place Order
            </button>

            <p className="text-xs text-gray-500 text-center">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;