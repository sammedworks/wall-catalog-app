'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Filter, Heart } from 'lucide-react';

const MATERIAL_TYPES = [
  { id: 'all', name: 'All looks' },
  { id: 'Wood', name: 'Wood' },
  { id: 'Marble', name: 'Marble' },
  { id: 'Rattan', name: 'Rattan' },
  { id: 'Fabric', name: 'Fabric' },
  { id: 'Leather', name: 'Leather' },
];

const STYLE_FILTERS = [
  { id: 'all', name: 'All Styles' },
  { id: 'Economy', name: 'Economy' },
  { id: 'Luxe', name: 'Luxe' },
  { id: 'Minimal', name: 'Minimal' },
  { id: 'Statement', name: 'Statement' },
];

const SPACE_CATEGORIES = [
  { 
    id: 'tv-unit', 
    name: 'TV Unit', 
    image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400&h=300&fit=crop',
  },
  { 
    id: 'living-room', 
    name: 'Living Room', 
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
  },
  { 
    id: 'bedroom', 
    name: 'Bedroom', 
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop',
  },
  { 
    id: 'entrance', 
    name: 'Entrance', 
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop',
  },
  { 
    id: 'study', 
    name: 'Study', 
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop',
  },
  { 
    id: 'mandir', 
    name: 'Mandir', 
    image: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=400&h=300&fit=crop',
  },
  { 
    id: 'kitchen', 
    name: 'Kitchen', 
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop',
  },
  { 
    id: 'bathroom', 
    name: 'Bathroom', 
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop',
  },
  { 
    id: 'balcony', 
    name: 'Balcony', 
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
  },
];

export default function HomePage() {
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDesigns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [designs, selectedMaterial, selectedStyle]);

  const loadDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      console.error('Error loading designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...designs];

    if (selectedMaterial !== 'all') {
      filtered = filtered.filter(design => design.material_type === selectedMaterial);
    }

    if (selectedStyle !== 'all') {
      filtered = filtered.filter(design => design.style_category === selectedStyle);
    }

    setFilteredDesigns(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              WALL CATALOG
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                href="/browse" 
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Catalog
              </Link>
              <Link 
                href="/quote" 
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg"
              >
                Get Quote
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        {/* Material Type Tabs */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              {MATERIAL_TYPES.map((material) => (
                <button
                  key={material.id}
                  onClick={() => setSelectedMaterial(material.id)}
                  className={`px-6 py-4 font-semibold whitespace-nowrap transition-all ${
                    selectedMaterial === material.id
                      ? 'border-b-2 border-black text-black'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {material.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Style Filter Pills */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-full font-semibold text-gray-700 hover:border-gray-400 transition-all whitespace-nowrap flex-shrink-0"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {STYLE_FILTERS.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedStyle === style.id
                    ? 'bg-black text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Filters</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Material Type</h4>
                <div className="space-y-2">
                  {MATERIAL_TYPES.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => setSelectedMaterial(material.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                        selectedMaterial === material.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {material.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3">Style</h4>
                <div className="space-y-2">
                  {STYLE_FILTERS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                        selectedStyle === style.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setSelectedMaterial('all');
                  setSelectedStyle('all');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Badge */}
      {(selectedMaterial !== 'all' || selectedStyle !== 'all') && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-blue-900">
                  {filteredDesigns.length} designs found
                </span>
                {selectedMaterial !== 'all' && (
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                    {selectedMaterial}
                  </span>
                )}
                {selectedStyle !== 'all' && (
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                    {selectedStyle}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedMaterial('all');
                  setSelectedStyle('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Explore By Space */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore By Space</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {SPACE_CATEGORIES.map((space) => (
              <Link
                key={space.id}
                href={`/designs?space=${space.id}`}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=' + space.name;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-semibold text-white text-center">
                    {space.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Wall Panel Designs */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedMaterial !== 'all' || selectedStyle !== 'all' 
                ? 'Filtered Designs' 
                : 'All Wall Panel Designs'}
            </h2>
            <Link 
              href="/designs" 
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading designs...</p>
              </div>
            </div>
          ) : filteredDesigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDesigns.map((design) => (
                <Link
                  key={design.id}
                  href={`/design-detail?id=${design.id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={design.image_url || 'https://via.placeholder.com/400x300?text=Wall+Panel'}
                      alt={design.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Wall+Panel';
                      }}
                    />
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-all">
                      <Heart className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {design.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {design.description || 'Premium wall panel design'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {design.material_type && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            {design.material_type}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        ₹{design.price_per_sqft}/sq.ft
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No designs match your filters
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters to see more designs
              </p>
              <button
                onClick={() => {
                  setSelectedMaterial('all');
                  setSelectedStyle('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
