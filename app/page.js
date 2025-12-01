'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
];

export default function HomePage() {
  const [materials, setMaterials] = useState([]);
  const materialSliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    checkScrollButtons();
  }, [materials]);

  const loadMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  };

  const scrollMaterialSlider = (direction) => {
    if (!materialSliderRef.current) return;
    
    const scrollAmount = 300;
    const newScrollLeft = materialSliderRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    materialSliderRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const checkScrollButtons = () => {
    if (!materialSliderRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = materialSliderRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleSliderScroll = () => {
    checkScrollButtons();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
                WALL CATALOG
              </div>
            </Link>
            
            {/* Menu */}
            <nav className="flex items-center gap-8">
              <Link 
                href="/browse" 
                className="text-base font-medium text-gray-900 hover:text-gray-600 transition-colors"
                style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}
              >
                Catalog
              </Link>
              <Link 
                href="/quote" 
                className="px-6 py-2.5 text-base font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all shadow-sm"
                style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}
              >
                Get Quote
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Section 1: Explore By Space */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
            Explore By Space
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {SPACE_CATEGORIES.map((space) => (
              <Link
                key={space.id}
                href={`/area/${space.id}`}
                className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-base font-semibold text-white text-center" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
                    {space.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 2: Explore By All Looks (Material Slider) */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
            Explore By All Looks
          </h2>
          
          {/* Material Slider */}
          {materials.length > 0 ? (
            <div className="relative group">
              {/* Left Scroll Button */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollMaterialSlider('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
                  style={{ marginLeft: '-24px' }}
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
              )}

              {/* Slider Container */}
              <div
                ref={materialSliderRef}
                onScroll={handleSliderScroll}
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {materials.map((material) => (
                  <Link
                    key={material.id}
                    href={`/browse?material=${material.slug}`}
                    className="flex-shrink-0 group/item transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex flex-col items-center gap-3">
                      {/* Material Thumbnail */}
                      <div
                        className="w-28 h-28 rounded-2xl shadow-md overflow-hidden transition-all duration-200 group-hover/item:shadow-xl"
                        style={{ backgroundColor: material.color_code }}
                      >
                        {material.thumbnail_url ? (
                          <img
                            src={material.thumbnail_url}
                            alt={material.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                      </div>
                      
                      {/* Material Name */}
                      <span 
                        className="text-sm font-medium text-gray-700 group-hover/item:text-gray-900 transition-colors"
                        style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}
                      >
                        {material.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right Scroll Button */}
              {canScrollRight && (
                <button
                  onClick={() => scrollMaterialSlider('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
                  style={{ marginRight: '-24px' }}
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">Loading materials...</p>
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
            Ready to Transform Your Space?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Browse our complete catalog or get a custom quote
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/browse"
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg text-lg"
            >
              View All Designs
            </Link>
            <Link
              href="/quote"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all text-lg"
            >
              Get Quote
            </Link>
          </div>
        </section>
      </div>

      {/* Hide scrollbar globally for slider */}
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