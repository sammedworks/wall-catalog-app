'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Heart, Search } from 'lucide-react';

const CATEGORIES = [
  { 
    id: 'living-room', 
    name: 'Living Room', 
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    gradient: 'from-amber-50 to-orange-50'
  },
  { 
    id: 'tv-unit', 
    name: 'TV Unit', 
    image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400&h=300&fit=crop',
    gradient: 'from-blue-50 to-indigo-50'
  },
  { 
    id: 'bedroom', 
    name: 'Bedroom', 
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop',
    gradient: 'from-purple-50 to-pink-50'
  },
];

const MATERIALS = [
  { id: 'marble', name: 'Marble', color: '#F5F5F5', textColor: '#374151' },
  { id: 'wooden', name: 'Wooden', color: '#8B4513', textColor: '#FFFFFF' },
  { id: 'fabric', name: 'Fabric', color: '#E8DCC4', textColor: '#374151' },
  { id: 'waffle', name: 'Waffle', color: '#D4A574', textColor: '#FFFFFF' },
  { id: 'grey', name: 'Grey', color: '#9CA3AF', textColor: '#FFFFFF' },
  { id: 'glass', name: 'Glass', color: '#DBEAFE', textColor: '#374151' },
];

const FILTER_CHIPS = [
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'living-room', label: 'Living room' },
  { id: 'tv-unit', label: 'TV unit' },
  { id: 'price-low', label: '₹ Low to High' },
  { id: 'price-high', label: '₹ High to Low' },
  { id: 'popular', label: 'Most Popular' },
];

export default function BrowsePage() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadDesigns();
    loadFavorites();
  }, []);

  const loadDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      console.error('Error loading designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(saved);
  };

  const toggleFavorite = (designId) => {
    let newFavorites;
    if (favorites.includes(designId)) {
      newFavorites = favorites.filter(id => id !== designId);
    } else {
      newFavorites = [...favorites, designId];
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const toggleFilter = (filterId) => {
    if (selectedFilters.includes(filterId)) {
      setSelectedFilters(selectedFilters.filter(id => id !== filterId));
    } else {
      setSelectedFilters([...selectedFilters, filterId]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-50 rounded-xl transition-all">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
                  Explore Designs
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">Discover premium interior solutions</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search designs..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all">
                Favorites
              </button>
              <button className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all">
                Get Quote
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Top Section - Category Cards */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
            Explore by Space
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/browse?category=${category.id}`}
                className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=' + category.name;
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-xl font-semibold text-white" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Middle Section - Material Swatches & Filters */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
            Explore All Looks
          </h2>
          
          {/* Material Swatches */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
            {MATERIALS.map((material) => (
              <button
                key={material.id}
                onClick={() => setSelectedMaterial(material.id === selectedMaterial ? null : material.id)}
                className={`flex-shrink-0 group transition-all duration-200 ${
                  selectedMaterial === material.id ? 'scale-105' : ''
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-16 h-16 rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-200 ${
                      selectedMaterial === material.id ? 'ring-3 ring-gray-900 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: material.color }}
                  ></div>
                  <span 
                    className="text-xs font-medium text-gray-700"
                    style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}
                  >
                    {material.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-3 flex-wrap">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.id}
                onClick={() => toggleFilter(chip.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedFilters.includes(chip.id)
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </section>

        {/* Bottom Section - Design Cards Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
              Premium Designs
            </h2>
            <p className="text-sm text-gray-500">
              {designs.length} designs available
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Loading designs...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  {/* Image */}
                  <Link href={`/design-detail?id=${design.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-50">
                    <img
                      src={design.image_url || 'https://via.placeholder.com/400x300?text=Design'}
                      alt={design.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Design';
                      }}
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(design.id);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 group/fav"
                    >
                      <Heart
                        className={`w-5 h-5 transition-all duration-200 ${
                          favorites.includes(design.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-600 group-hover/fav:text-red-500'
                        }`}
                      />
                    </button>
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    <Link href={`/design-detail?id=${design.id}`}>
                      <h3 
                        className="text-base font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors"
                        style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}
                      >
                        {design.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {design.description || 'Premium interior design solution'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Starting from</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ₹{design.price_per_sqft}
                            <span className="text-sm font-normal text-gray-500">/sq ft</span>
                          </p>
                        </div>
                        <div className="px-3 py-1.5 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-600">
                            {design.finish_type || 'Premium'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && designs.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No designs found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or check back later
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}