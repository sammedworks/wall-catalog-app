'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Filter, X, ChevronDown } from 'lucide-react';

const LOOK_OPTIONS = ['Wood', 'Marble', 'Rattan', 'Fabric', 'Limewash', 'Pastel', 'Stone', 'Gold', 'Traditional'];
const BUDGET_OPTIONS = ['Economy', 'Minimal', 'Luxe', 'Statement'];
const LIGHTING_OPTIONS = ['Cove Light', 'Profile Light', 'Wall Washer Light'];

function DesignsContent() {
  const searchParams = useSearchParams();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    look: searchParams.get('look') || '',
    budget: '',
    lighting: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadDesigns();
  }, []);

  useEffect(() => {
    // Pre-select look from URL
    const lookParam = searchParams.get('look');
    if (lookParam) {
      setFilters(prev => ({ ...prev, look: lookParam }));
    }
  }, [searchParams]);

  const loadDesigns = async () => {
    setLoading(true);
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
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDesigns = designs.filter(design => {
    if (filters.look && design.material_type !== filters.look) return false;
    if (filters.budget && design.style_category !== filters.budget) return false;
    if (filters.lighting && design.lighting_type !== filters.lighting) return false;
    return true;
  });

  const handleFilterChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? '' : value
    }));
  };

  const clearFilters = () => {
    setFilters({ look: '', budget: '', lighting: '' });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
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

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Designs</h1>
          <p className="text-lg text-gray-600">
            {filteredDesigns.length} {filteredDesigns.length === 1 ? 'design' : 'designs'} available
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Filter Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3 flex-1">
              {/* Look Filter */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-all">
                  Look / Material
                  {filters.look && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                      {filters.look}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-4 space-y-2">
                    {LOOK_OPTIONS.map(option => (
                      <button
                        key={option}
                        onClick={() => handleFilterChange('look', option)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all ${
                          filters.look === option
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget Filter */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-all">
                  Budget
                  {filters.budget && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                      {filters.budget}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-4 space-y-2">
                    {BUDGET_OPTIONS.map(option => (
                      <button
                        key={option}
                        onClick={() => handleFilterChange('budget', option)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all ${
                          filters.budget === option
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lighting Filter */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:border-gray-400 transition-all">
                  Lighting Type
                  {filters.lighting && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                      {filters.lighting}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-4 space-y-2">
                    {LIGHTING_OPTIONS.map(option => (
                      <button
                        key={option}
                        onClick={() => handleFilterChange('lighting', option)}
                        className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all ${
                          filters.lighting === option
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition-all"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          {/* Mobile Filters Dropdown */}
          {showFilters && (
            <div className="lg:hidden mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
              {/* Look Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Look / Material
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LOOK_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => handleFilterChange('look', option)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filters.look === option
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Budget
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGET_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => handleFilterChange('budget', option)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filters.budget === option
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Lighting Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {LIGHTING_OPTIONS.map(option => (
                    <button
                      key={option}
                      onClick={() => handleFilterChange('lighting', option)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filters.lighting === option
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
              {filters.look && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {filters.look}
                  <button onClick={() => handleFilterChange('look', filters.look)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.budget && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {filters.budget}
                  <button onClick={() => handleFilterChange('budget', filters.budget)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.lighting && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {filters.lighting}
                  <button onClick={() => handleFilterChange('lighting', filters.lighting)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Designs Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading designs...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No designs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters</p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredDesigns.map((design) => (
              <Link
                key={design.id}
                href={`/design/${design.id}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <img
                    src={design.image_url}
                    alt={design.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x600?text=' + encodeURIComponent(design.name);
                    }}
                  />
                  {/* Tags Overlay */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {design.material_type && (
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                        {design.material_type}
                      </span>
                    )}
                    {design.style_category && (
                      <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                        {design.style_category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {design.name}
                  </h3>
                  {design.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {design.description}
                    </p>
                  )}
                  
                  {/* Details */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {design.lighting_type && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded">
                          {design.lighting_type}
                        </span>
                      )}
                      {design.space_category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                          {design.space_category}
                        </span>
                      )}
                    </div>
                    {design.price_per_sqft && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{design.price_per_sqft}
                        </p>
                        <p className="text-xs text-gray-500">per sq.ft</p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DesignsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <DesignsContent />
    </Suspense>
  );
}
