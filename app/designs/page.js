'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const ROOM_AREAS = [
  { id: 'tv-unit', name: 'TV Unit', icon: '📺', color: 'from-blue-500 to-blue-600' },
  { id: 'living-room', name: 'Living Room', icon: '🛋️', color: 'from-amber-500 to-orange-600' },
  { id: 'bedroom', name: 'Bedroom', icon: '🛏️', color: 'from-purple-500 to-purple-600' },
  { id: 'entrance', name: 'Entrance', icon: '🚪', color: 'from-green-500 to-green-600' },
  { id: 'study', name: 'Study', icon: '📚', color: 'from-indigo-500 to-indigo-600' },
  { id: 'mandir', name: 'Mandir', icon: '🕉️', color: 'from-rose-500 to-pink-600' },
];

export default function DesignsPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageIndexes, setImageIndexes] = useState({});

  useEffect(() => {
    if (selectedRoom) {
      loadDesigns();
    }
  }, [selectedRoom]);

  const loadDesigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('space_category', selectedRoom.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Initialize image indexes for slider
      const indexes = {};
      (data || []).forEach(design => {
        indexes[design.id] = 0;
      });
      setImageIndexes(indexes);
      setDesigns(data || []);
    } catch (error) {
      console.error('Error loading designs:', error);
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = (designId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndexes(prev => ({
      ...prev,
      [designId]: prev[designId] === 0 ? 1 : 0
    }));
  };

  const prevImage = (designId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndexes(prev => ({
      ...prev,
      [designId]: prev[designId] === 0 ? 1 : 0
    }));
  };

  const getDesignImages = (design) => {
    const images = [];
    if (design.image_url) images.push(design.image_url);
    if (design.image_url_2) images.push(design.image_url_2);
    if (images.length === 0) {
      images.push('https://via.placeholder.com/400x300?text=Design+Preview');
    }
    return images;
  };

  // Step 1: Room Selection
  if (!selectedRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Design Library</h1>
                <p className="text-xs text-gray-600">Which area do you want to design?</p>
              </div>
            </div>
          </div>
        </header>

        {/* Room Selection */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Which area do you want to design?
            </h2>
            <p className="text-lg text-gray-600">
              Select a space to explore our curated designs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {ROOM_AREAS.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-2"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-24 h-24 bg-gradient-to-br ${room.color} rounded-2xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform shadow-lg`}>
                    {room.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {room.name}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                    View Designs
                    <span className="text-xl">→</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Design Grid
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedRoom(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${selectedRoom.color} rounded-xl flex items-center justify-center text-2xl`}>
                {selectedRoom.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{selectedRoom.name} Designs</h1>
                <p className="text-xs text-gray-600">{designs.length} premium designs</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Designs Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading designs...</p>
            </div>
          </div>
        ) : designs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => {
              const images = getDesignImages(design);
              const currentIndex = imageIndexes[design.id] || 0;
              const hasMultipleImages = images.length > 1;

              return (
                <div
                  key={design.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Image Slider */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    <Link href={`/design-detail?id=${design.id}`}>
                      <img
                        src={images[currentIndex]}
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Design+Preview';
                        }}
                      />
                    </Link>

                    {/* Image Navigation */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={(e) => prevImage(design.id, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => nextImage(design.id, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                      <span className="text-sm font-bold text-blue-600">
                        ₹{design.price_per_sqft}/sq.ft
                      </span>
                    </div>
                  </div>

                  {/* Design Info */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {design.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {design.description || 'Premium wall panel design with modern aesthetics and superior quality materials'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        <span className="text-gray-700 font-medium">{design.finish_type || 'Premium'}</span>
                      </div>
                      <div className="text-gray-500">•</div>
                      <div className="text-gray-700 font-semibold">
                        Starting ₹{(design.price_per_sqft * 100).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Link
                      href={`/design-detail?id=${design.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Eye className="w-5 h-5" />
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No designs available yet
            </h3>
            <p className="text-gray-600 mb-6">
              We're adding new designs for {selectedRoom.name} soon. Check back later!
            </p>
            <button
              onClick={() => setSelectedRoom(null)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Choose Another Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
}