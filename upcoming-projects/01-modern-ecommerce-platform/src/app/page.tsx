import Link from 'next/link';
'use client';

import { useState } from 'react';

const products = [
  { id: 1, name: 'Modern Laptop', price: 999, image: '/api/placeholder/300/300' },
  { id: 2, name: 'Wireless Headphones', price: 199, image: '/api/placeholder/300/300' },
  { id: 3, name: 'Smart Watch', price: 299, image: '/api/placeholder/300/300' },
  { id: 4, name: 'Premium Phone', price: 799, image: '/api/placeholder/300/300' },
];

export default function Home() {
  const [cart, setCart] = useState<Array<{id: number, name: string, price: number, quantity: number}>>([]);

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ModernStore</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Cart: ${cartTotal}</span>
              <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">Modern E-Commerce</h2>
          <p className="text-xl mb-8">Discover premium products at unbeatable prices</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Shop Now
          </button>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">Featured Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-2 text-gray-900">{product.name}</h4>
                <p className="text-2xl font-bold text-blue-600 mb-4">${product.price}</p>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Shopping Cart</h3>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-900">{item.name} x {item.quantity}</span>
                <span className="font-semibold text-gray-900">${item.price * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 font-bold text-lg">
              <span className="text-gray-900">Total:</span>
              <span className="text-blue-600">${cartTotal}</span>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h4 className="text-xl font-bold mb-4">ModernStore</h4>
          <p className="text-gray-400">Premium e-commerce experience built with Next.js</p>
        </div>
      </footer>
    </div>
  );
}
