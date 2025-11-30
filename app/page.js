'use client';
import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/supabase';
import { generateQuotationPDF } from '@/lib/pdfGenerator';
import { Search, Filter, Heart, X, Download, Mail, Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ROOM_CATEGORIES = [
  { name: 'Living room', icon: '🛋️' },
  { name: 'TV unit', icon: '📺' },
  { name: 'Bedroom', icon: '🛏️' },
  { name: 'Ceiling', icon: '⬆️' }
];

const FINISHES = [
  { name: 'Marble', color: '#f5f5dc' },
  { name: 'Wooden', color: '#8b4513' },
  { name: 'Fabric', color: '#e0e0e0' },
  { name: 'Metallic', color: '#c0c0c0' }
];

const COLOR_TONES = ['Light', 'Dark', 'Grey', 'Beige'];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedFinish, setSelectedFinish] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [quotationList, setQuotationList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedRoom, selectedFinish, selectedColor, priceRange, searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await getProducts();
    if (!error && data) {
      console.log('Products loaded:', data);
      setProducts(data);
    } else {
      console.error('Error loading products:', error);
    }
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedRoom) {
      filtered = filtered.filter(p => p.room_type === selectedRoom);
    }
    if (selectedFinish) {
      filtered = filtered.filter(p => p.finish_type === selectedFinish);
    }
    if (selectedColor) {
      filtered = filtered.filter(p => p.color_tone === selectedColor);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    filtered = filtered.filter(p => 
      p.price_per_sqft >= priceRange[0] && p.price_per_sqft <= priceRange[1]
    );

    setFilteredProducts(filtered);
  };

  const toggleQuotation = (product) => {
    if (quotationList.find(p => p.id === product.id)) {
      setQuotationList(quotationList.filter(p => p.id !== product.id));
    } else {
      setQuotationList([...quotationList, product]);
    }
  };

  const isInQuotation = (productId) => {
    return quotationList.some(p => p.id === productId);
  };

  const totalEstimate = quotationList.reduce((sum, p) => sum + parseFloat(p.price_per_sqft), 0);

  const exportQuotation = () => {
    const quotationData = {
      id: null,
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      notes: 'Generated from Wall Catalog'
    };
    generateQuotationPDF(quotationData, quotationList);
  };

  const clearFilters = () => {
    setSelectedRoom(null);
    setSelectedFinish(null);
    setSelectedColor(null);
    setPriceRange([0, 500]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-md sticky top-0 z-40 border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🏠
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wall Catalog</h1>
                <p className="text-xs text-gray-500">Premium Wall Panels</p>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <button
                onClick={() => setShowContact(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-lg"
              >
                <Mail className="w-5 h-5" />
                Contact
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg">
                <Heart className="w-5 h-5" />
                <span className="hidden xl:inline">Quotation</span> ({quotationList.length})
              </button>
              <Link href="/login" className="px-5 py-2.5 text-blue-600 hover:text-blue-700 font-semibold border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all">
                Admin
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden mt-4 pb-4 space-y-3 border-t pt-4">
              <input
                type="text"
                placeholder="Search designs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
                <button
                  onClick={() => setShowContact(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700"
                >
                  <Mail className="w-5 h-5" />
                  Contact
                </button>
              </div>
              <Link href="/login" className="block text-center px-4 py-2.5 text-blue-600 font-semibold border-2 border-blue-600 rounded-xl hover:bg-blue-50">
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Room Categories - Optimized for Tablet */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-5 text-gray-800">Explore designs for</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ROOM_CATEGORIES.map((room) => (
              <button
                key={room.name}
                onClick={() => setSelectedRoom(selectedRoom === room.name ? null : room.name)}
                className={`p-6 lg:p-8 rounded-2xl border-3 transition-all text-center shadow-md hover:shadow-xl ${
                  selectedRoom === room.name
                    ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 scale-105'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="text-5xl lg:text-6xl mb-3">{room.icon}</div>
                <div className="font-semibold text-base lg:text-lg">{room.name}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Finish Types */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-5 text-gray-800">Explore all looks</h2>
          <div className="flex gap-4 flex-wrap">
            {FINISHES.map((finish) => (
              <button
                key={finish.name}
                onClick={() => setSelectedFinish(selectedFinish === finish.name ? null : finish.name)}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-3 transition-all shadow-md hover:shadow-xl ${
                  selectedFinish === finish.name
                    ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 scale-105'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div
                  className="w-20 h-20 rounded-xl shadow-inner border-2 border-gray-300"
                  style={{ backgroundColor: finish.color }}
                />
                <span className="text-sm font-semibold">{finish.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Advanced Filters</h3>
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Color Tone</label>
                <select
                  value={selectedColor || ''}
                  onChange={(e) => setSelectedColor(e.target.value || null)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Colors</option>
                  {COLOR_TONES.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Min Price (₹/sq.ft)</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Max Price (₹/sq.ft)</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(selectedRoom || selectedFinish || selectedColor) && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 font-semibold">Active filters:</span>
            {selectedRoom && (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2 font-medium">
                {selectedRoom}
                <X className="w-4 h-4 cursor-pointer hover:text-blue-900" onClick={() => setSelectedRoom(null)} />
              </span>
            )}
            {selectedFinish && (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2 font-medium">
                {selectedFinish}
                <X className="w-4 h-4 cursor-pointer hover:text-blue-900" onClick={() => setSelectedFinish(null)} />
              </span>
            )}
            {selectedColor && (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2 font-medium">
                {selectedColor}
                <X className="w-4 h-4 cursor-pointer hover:text-blue-900" onClick={() => setSelectedColor(null)} />
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium text-lg">Loading products...</p>
          </div>
        )}

        {/* Product Grid - Optimized for Tablet */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-gray-100 hover:border-blue-300"
              >
                <div className="relative aspect-[4/3] bg-gray-100" onClick={() => setSelectedProduct(product)}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        console.error('Image failed to load:', product.image_url);
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                      <span className="text-lg">No Image</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuotation(product);
                    }}
                    className={`absolute top-4 right-4 p-3 rounded-full transition-all shadow-lg ${
                      isInQuotation(product.id)
                        ? 'bg-red-500 text-white scale-110'
                        : 'bg-white/95 text-gray-600 hover:bg-red-500 hover:text-white hover:scale-110'
                    }`}
                  >
                    <Heart className="w-6 h-6" fill={isInQuotation(product.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2 text-gray-900">{product.name}</h3>
                  <p className="text-blue-600 font-bold text-lg mb-3">₹{product.price_per_sqft}/sq ft</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-3 py-1.5 bg-gray-100 rounded-lg font-medium">{product.finish_type}</span>
                    <span className="px-3 py-1.5 bg-gray-100 rounded-lg font-medium">{product.room_type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-xl mb-4">No products found matching your filters</p>
            <button onClick={clearFilters} className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal - Enhanced */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div>
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full rounded-2xl shadow-lg"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-full aspect-[4/3] rounded-2xl bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xl">No Image Available</span>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 text-gray-900">{selectedProduct.name}</h2>
                    <p className="text-gray-500 font-medium">SKU: {selectedProduct.sku}</p>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                    <X className="w-7 h-7" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Details</h3>
                    <div className="space-y-3 text-base">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 font-medium">Finish:</span>
                        <span className="font-semibold">{selectedProduct.finish_type}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 font-medium">Room Type:</span>
                        <span className="font-semibold">{selectedProduct.room_type}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 font-medium">Color Tone:</span>
                        <span className="font-semibold">{selectedProduct.color_tone}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 font-medium">Dimensions:</span>
                        <span className="font-semibold">{selectedProduct.dimensions}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600 font-medium">Installation:</span>
                        <span className="font-semibold">{selectedProduct.installation_type}</span>
                      </div>
                    </div>
                  </div>

                  {selectedProduct.description && (
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-800">Description</h3>
                      <p className="text-base text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                    </div>
                  )}

                  <div className="pt-6 border-t-2">
                    <div className="text-4xl font-bold text-blue-600 mb-6">
                      ₹{selectedProduct.price_per_sqft}/sq.ft
                    </div>
                    <button
                      onClick={() => {
                        toggleQuotation(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                        isInQuotation(selectedProduct.id)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isInQuotation(selectedProduct.id) ? 'Remove from Quotation' : 'Add to Quotation'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Sidebar - Enhanced */}
      {quotationList.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[600px] overflow-auto z-50 border-2 border-blue-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-gray-900">Quotation List</h3>
            <button onClick={exportQuotation} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-semibold shadow-lg">
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>
          
          <div className="space-y-3 mb-5">
            {quotationList.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-20 h-20 rounded-xl object-cover shadow-md"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-400">No img</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base truncate text-gray-900">{product.name}</p>
                  <p className="text-sm text-blue-600 font-bold">₹{product.price_per_sqft}/sq.ft</p>
                </div>
                <button
                  onClick={() => toggleQuotation(product)}
                  className="p-2 hover:bg-red-100 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-5 border-t-2 border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-medium">Total Items:</span>
              <span className="font-bold text-lg">{quotationList.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Estimated Total:</span>
              <span className="text-2xl font-bold text-blue-600">₹{totalEstimate.toFixed(2)}/sq.ft</span>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal - Enhanced */}
      {showContact && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowContact(false)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
              <button onClick={() => setShowContact(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <X className="w-7 h-7" />
              </button>
            </div>
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg transition-all"
              >
                Send Enquiry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}