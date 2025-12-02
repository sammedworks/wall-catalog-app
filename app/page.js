'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ExploreByViewSlider from '@/components/ExploreByViewSlider';

const SPACE_CATEGORIES = [
  { 
    id: 'tv-unit', 
    name: 'TV Unit Wall', 
    image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=600&h=400&fit=crop',
  },
  { 
    id: 'living-room', 
    name: 'Living Room Wall', 
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
  },
  { 
    id: 'bedroom', 
    name: 'Bedroom Wall', 
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=400&fit=crop',
  },
  { 
    id: 'entrance', 
    name: 'Entrance Wall', 
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=400&fit=crop',
  },
  { 
    id: 'study', 
    name: 'Study Wall', 
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&h=400&fit=crop',
  },
  { 
    id: 'mandir', 
    name: 'Mandir Wall', 
    image: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=600&h=400&fit=crop',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              WALL CATALOG
            </Link>
            <Link 
              href="/quote" 
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all"
            >
              Get Quote
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section 1: Explore by Space */}
        <section className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore by Space</h2>
            <p className="text-gray-600">Choose your room to see wall design ideas</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPACE_CATEGORIES.map((space) => (
              <Link
                key={space.id}
                href={`/space/${space.id}`}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-[3/2] relative">
                  <img
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400?text=' + space.name;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {space.name}
                  </h3>
                  <div className="flex items-center text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Designs
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Section 2: Explore by View (New Slider Component) */}
      <ExploreByViewSlider />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section 3: Explore All Designs */}
        <section>
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Explore All Designs
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Browse our complete collection of wall designs with advanced filters for material, budget, and lighting
              </p>
              <Link
                href="/designs"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
              >
                View Full Gallery
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
