'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { useParams } from 'next/navigation';

const SPACE_NAMES = {
  'tv-unit': 'TV Unit',
  'living-room': 'Living Room',
  'bedroom': 'Bedroom',
  'entrance': 'Entrance',
  'study': 'Study',
  'mandir': 'Mandir',
};

export default function AreaPage() {
  const params = useParams();
  const areaId = params.id;
  const areaName = SPACE_NAMES[areaId] || 'Area';

  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadDesigns();
    loadFavorites();
  }, [areaId]);

  const loadDesigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('space_category', areaId)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
              {areaName}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
            Designs for {areaName}
          </h2>
          <p className="text-gray-600">
            {designs.length} {designs.length === 1 ? 'design' : 'designs'} available
          </p>
        </div>

        {/* Design Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm">Loading designs...</p>
            </div>
          </div>
        ) : designs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <div
                key={design.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <Link href={`/design-detail?id=${design.id}`}>
                    <img
                      src={design.image_url || 'https://via.placeholder.com/400x300?text=Design'}
                      alt={design.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Design';
                      }}
                    />
                  </Link>
                  
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
                </div>

                {/* Content */}
                <div className="p-5">
                  <Link href={`/design-detail?id=${design.id}`}>
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition-colors"
                      style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}
                    >
                      {design.name}
                    </h3>
                    
                    {/* Tags */}
                    {design.tags && Object.keys(design.tags).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.keys(design.tags).slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Starting from</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ₹{design.price_per_sqft}
                          <span className="text-sm font-normal text-gray-500">/sq ft</span>
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all">
                        View Design
                      </button>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No designs found for {areaName}
            </h3>
            <p className="text-gray-500 mb-6">
              Check back later for new designs
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-sm"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}