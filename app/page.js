'use client';
import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/supabase';
import { generateQuotationPDF } from '@/lib/pdfGenerator';
import { Search, Filter, Heart, X, Download, Mail } from 'lucide-react';
import Link from 'next/link';

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
      setProducts(data);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-gray-900">🏠 Wall Catalog</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search designs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <button
                onClick={() => setShowContact(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Mail className="w-5 h-5" />
                Contact
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Heart className="w-5 h-5" />
                Quotation ({quotationList.length})
              </button>
              <Link href="/login" className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Room Categories */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Explore designs for</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ROOM_CATEGORIES.map((room) => (
              <button
                key={room.name}
                onClick={() => setSelectedRoom(selectedRoom === room.name ? null : room.name)}
                className={`p-6 rounded-xl border-2 transition-all text-center ${
                  selectedRoom === room.name
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-2">{room.icon}</div>
                <div className="font-medium">{room.name}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Finish Types */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Explore all looks</h2>
          <div className="flex gap-4 flex-wrap">
            {FINISHES.map((finish) => (
              <button
                key={finish.name}
                onClick={() => setSelectedFinish(selectedFinish === finish.name ? null : finish.name)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  selectedFinish === finish.name
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className="w-16 h-16 rounded-lg"
                  style={{ backgroundColor: finish.color }}
                />
                <span className="text-sm font-medium">{finish.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Advanced Filters</h3>
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700">
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Color Tone</label>
                <select
                  value={selectedColor || ''}
                  onChange={(e) => setSelectedColor(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Colors</option>
                  {COLOR_TONES.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Min Price (₹/sq.ft)</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Price (₹/sq.ft)</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(selectedRoom || selectedFinish || selectedColor) && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedRoom && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                {selectedRoom}
                <X className="w-4 h-4 cursor-pointer" onClick={() => setSelectedRoom(null)} />
              </span>
            )}
            {selectedFinish && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                {selectedFinish}
                <X className="w-4 h-4 cursor-pointer" onClick={() => setSelectedFinish(null)} />
              </span>
            )}
            {selectedColor && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                {selectedColor}
                <X className="w-4 h-4 cursor-pointer" onClick={() => setSelectedColor(null)} />
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="relative aspect-[4/3]" onClick={() => setSelectedProduct(product)}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuotation(product);
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                      isInQuotation(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={isInQuotation(product.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">Approx. ₹{product.price_per_sqft}/sq ft</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">{product.finish_type}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{product.room_type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your filters</p>
            <button onClick={clearFilters} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div>
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full rounded-xl"
                />
              </div>
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                    <p className="text-gray-600">SKU: {selectedProduct.sku}</p>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Finish:</span>
                        <span className="font-medium">{selectedProduct.finish_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Type:</span>
                        <span className="font-medium">{selectedProduct.room_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Color Tone:</span>
                        <span className="font-medium">{selectedProduct.color_tone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium">{selectedProduct.dimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Installation:</span>
                        <span className="font-medium">{selectedProduct.installation_type}</span>
                      </div>
                    </div>
                  </div>

                  {selectedProduct.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="text-3xl font-bold text-blue-600 mb-4">
                      ₹{selectedProduct.price_per_sqft}/sq.ft
                    </div>
                    <button
                      onClick={() => {
                        toggleQuotation(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
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

      {/* Quotation Sidebar */}
      {quotationList.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl p-6 w-96 max-h-[500px] overflow-auto z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Quotation List</h3>
            <button onClick={exportQuotation} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
          
          <div className="space-y-3 mb-4">
            {quotationList.map((product) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-600">₹{product.price_per_sqft}/sq.ft</p>
                </div>
                <button
                  onClick={() => toggleQuotation(product)}
                  className="p-1 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-semibold">{quotationList.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Estimated Total:</span>
              <span className="text-xl font-bold text-blue-600">₹{totalEstimate.toFixed(2)}/sq.ft</span>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowContact(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <button onClick={() => setShowContact(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
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