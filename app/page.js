'use client';
import Link from 'next/link';
import { Palette, FileText, Phone, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Wall Catalog</h1>
                <p className="text-xs text-gray-600">Premium Wall Designs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/browse"
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Browse UI
              </Link>
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Transform Your Space
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Explore premium wall panel designs, get instant quotes, and bring your vision to life
          </p>
        </div>

        {/* 3 Large Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Button 1: Browse Designs */}
          <Link
            href="/designs"
            className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Palette className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Browse Designs
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Explore our collection of premium wall panel designs for every room in your home
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  Start Exploring
                  <span className="text-xl">→</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Button 2: Get Quote */}
          <Link
            href="/quote"
            className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Get Quote
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Get instant pricing for your selected design with material options and add-ons
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
                  Request Quote
                  <span className="text-xl">→</span>
                </span>
              </div>
            </div>
          </Link>

          {/* Button 3: Contact Us */}
          <Link
            href="/contact"
            className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-500 transform hover:-translate-y-2"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Contact Us
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Have questions? Our design experts are here to help you create your dream space
                </p>
              </div>
              <div className="pt-4">
                <span className="inline-flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                  Get in Touch
                  <span className="text-xl">→</span>
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* New Browse UI Card */}
        <div className="mt-8 max-w-5xl mx-auto">
          <Link
            href="/browse"
            className="group bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Premium Browse Experience
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Explore our tablet-optimized UI with material swatches, filters, and premium design cards
                  </p>
                </div>
              </div>
              <div className="text-white font-semibold text-lg group-hover:translate-x-2 transition-transform">
                →
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-3">✨</div>
            <h4 className="font-bold text-gray-900 mb-2">Premium Quality</h4>
            <p className="text-sm text-gray-600">High-quality materials and expert craftsmanship</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">💰</div>
            <h4 className="font-bold text-gray-900 mb-2">Transparent Pricing</h4>
            <p className="text-sm text-gray-600">No hidden costs, instant price calculations</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h4 className="font-bold text-gray-900 mb-2">Quick Installation</h4>
            <p className="text-sm text-gray-600">Professional installation in 2-3 days</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Wall Catalog. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}