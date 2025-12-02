'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Filter, X } from 'lucide-react';

const LOOK_FILTERS = [
  'Wood', 'Marble', 'Rattan', 'Fabric', 'Limewash', 'Pastel', 'Stone', 'Gold', 'Traditional'
];

const BUDGET_FILTERS = [
  'Economy', 'Minimal', 'Luxe', 'Statement'
];

const LIGHTING_FILTERS = [
  'Cove Light', 'Profile Light', 'Wall Washer Light'
];

export default function DesignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const [selectedLook, setSelectedLook] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [selectedLighting, setSelectedLighting] = useState('All');

  useEffect(() => {
    loadDesigns();
    
    // Check URL params for initial filter
    const lookParam = searchParams.get('look');
    if (lookParam) {
      setSelectedLook(lookParam.charAt(0).toUpperCase() + lookParam.slice(1));
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [designs, selectedLook, selectedBudget, selectedLighting]);

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

  const applyFilters = () => {
    let filtered = [...designs];

    if (selectedLook !== 'All') {
      filtered = filtered.filter(design => 
        design.material_type?.toLowerCase() === selectedLook.toLowerCase()
      );
    }

    if (selectedBudget !== 'All') {
      filtered = filtered.filter(design => 
        design.style_category?.toLowerCase() === selectedBudget.toLowerCase()
      );
    }

    if (selectedLighting !== 'All') {
      filtered = filtered.filter(design => 
        design.lighting_type?.toLowerCase() === selectedLighting.toLowerCase()
      );
    }

    setFilteredDesigns(filtered);
  };

  const clearFilters = () => {
    setSelectedLook('All');
    setSelectedBudget('All');
    setSelectedLighting('All');
  };

  const activeFilterCount = [selectedLook, selectedBudget, selectedLighting].filter(f => f !== 'All').length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">All Wall Designs</h1>
              <p className="text-sm text-gray-600">Browse our complete collection</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <section className="bg-gray-50 border-b border-gray-200 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {filteredDesigns.length} Designs
            </h3>
            <button
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-gray-400 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectedLook !== 'All' && (
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-semibold flex items-center gap-2">
                  Look: {selectedLook}
                  <button onClick={() => setSelectedLook('All')} className="hover:bg-blue-700 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedBudget !== 'All' && (
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-semibold flex items-center gap-2">
                  Budget: {selectedBudget}
                  <button onClick={() => setSelectedBudget('All')} className="hover:bg-blue-700 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedLighting !== 'All' && (
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-semibold flex items-center gap-2">
                  Lighting: {selectedLighting}
                  <button onClick={() => setSelectedLighting('All')} className="hover:bg-blue-700 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">Filters</h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Look / Material */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Look / Material</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedLook('All')}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      selectedLook === 'All'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {LOOK_FILTERS.map((look) => (
                    <button
                      key={look}
                      onClick={() => setSelectedLook(look)}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        selectedLook === look
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {look}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Budget</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedBudget('All')}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      selectedBudget === 'All'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {BUDGET_FILTERS.map((budget) => (
                    <button
                      key={budget}
                      onClick={() => setSelectedBudget(budget)}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        selectedBudget === budget
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {budget}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting Type */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Lighting Type</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedLighting('All')}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      selectedLighting === 'All'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {LIGHTING_FILTERS.map((lighting) => (
                    <button
                      key={lighting}
                      onClick={() => setSelectedLighting(lighting)}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        selectedLighting === lighting
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lighting}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={clearFilters}
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

      {/* Designs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading designs...</p>
            </div>
          </div>
        ) : filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDesigns.map((design) => (
              <Link
                key={design.id}
                href={`/design-detail?id=${design.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  <img
                    src={design.image_url || 'https://via.placeholder.com/400x300?text=Wall+Design'}
                    alt={design.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Wall+Design';
                    }}
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {design.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {design.description || 'Premium wall design'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {design.material_type && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {design.material_type}
                        </span>
                      )}
                      {design.style_category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {design.style_category}
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
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No designs match your filters
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters to see more designs
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
