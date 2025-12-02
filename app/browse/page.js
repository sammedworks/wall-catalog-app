'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Heart, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

// Space categories - can be made dynamic later
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

export default function BrowsePage() {
  // State management
  const [designs, setDesigns] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  
  // Slider refs
  const materialSliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
    loadFavorites();
  }, []);

  // Reload designs when filters change
  useEffect(() => {
    if (!loading) {
      loadDesigns();
    }
  }, [selectedMaterials, selectedTags, selectedSpace]);

  // Check scroll buttons when materials load
  useEffect(() => {
    checkScrollButtons();
  }, [materials]);

  // ============================================
  // DATA LOADING FUNCTIONS
  // ============================================

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all data in parallel
      await Promise.all([
        loadMaterials(),
        loadTags(),
        loadDesigns()
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load catalog data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      console.log('Loading materials...');
      
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Materials error:', error);
        throw error;
      }

      console.log('Materials loaded:', data?.length || 0);
      setMaterials(data || []);
      
      return data;
    } catch (error) {
      console.error('Error loading materials:', error);
      // Don't throw - allow page to continue with empty materials
      setMaterials([]);
      return [];
    }
  };

  const loadTags = async () => {
    try {
      console.log('Loading tags...');
      
      const { data, error } = await supabase
        .from('design_tags')
        .select('*')
        .eq('is_active', true)
        .order('category, display_order');

      if (error) {
        console.error('Tags error:', error);
        throw error;
      }

      console.log('Tags loaded:', data?.length || 0);
      setTags(data || []);
      
      return data;
    } catch (error) {
      console.error('Error loading tags:', error);
      // Don't throw - allow page to continue with empty tags
      setTags([]);
      return [];
    }
  };

  const loadDesigns = async () => {
    try {
      console.log('Loading designs with filters:', {
        space: selectedSpace,
        materials: selectedMaterials,
        tags: selectedTags
      });

      // Try designs table first (new structure)
      let query = supabase
        .from('designs')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (selectedSpace) {
        query = query.eq('space_category', selectedSpace);
      }

      if (selectedMaterials.length > 0) {
        query = query.overlaps('material_slugs', selectedMaterials);
      }

      if (selectedTags.length > 0) {
        query = query.overlaps('tag_slugs', selectedTags);
      }

      query = query.order('display_order', { ascending: true })
                   .order('created_at', { ascending: false });

      let { data, error } = await query;

      // Fallback to products table if designs table is empty or has error
      if (error || !data || data.length === 0) {
        console.log('Trying products table as fallback...');
        
        query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (selectedSpace) {
          query = query.eq('space_category', selectedSpace);
        }

        if (selectedMaterials.length > 0) {
          // Try both material_slugs and material_names for backward compatibility
          query = query.or(`material_slugs.ov.{${selectedMaterials.join(',')}},material_names.ov.{${selectedMaterials.join(',')}}`);
        }

        query = query.order('created_at', { ascending: false });

        const result = await query;
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Designs error:', error);
        throw error;
      }

      console.log('Designs loaded:', data?.length || 0);

      // Initialize image indexes
      const indexes = {};
      (data || []).forEach(design => {
        indexes[design.id] = 0;
      });
      setImageIndexes(indexes);

      setDesigns(data || []);
      return data;
    } catch (error) {
      console.error('Error loading designs:', error);
      setDesigns([]);
      return [];
    }
  };

  const loadFavorites = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(saved);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  // ============================================
  // INTERACTION HANDLERS
  // ============================================

  const toggleFavorite = (designId) => {
    try {
      let newFavorites;
      if (favorites.includes(designId)) {
        newFavorites = favorites.filter(id => id !== designId);
      } else {
        newFavorites = [...favorites, designId];
      }
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleMaterial = (materialSlug) => {
    if (selectedMaterials.includes(materialSlug)) {
      setSelectedMaterials(selectedMaterials.filter(slug => slug !== materialSlug));
    } else {
      setSelectedMaterials([...selectedMaterials, materialSlug]);
    }
  };

  const toggleTag = (tagSlug) => {
    if (selectedTags.includes(tagSlug)) {
      setSelectedTags(selectedTags.filter(slug => slug !== tagSlug));
    } else {
      setSelectedTags([...selectedTags, tagSlug]);
    }
  };

  const clearAllFilters = () => {
    setSelectedMaterials([]);
    setSelectedTags([]);
    setSelectedSpace(null);
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
      images.push('https://via.placeholder.com/400x300?text=Design');
    }
    return images;
  };

  // ============================================
  // SLIDER FUNCTIONS
  // ============================================

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

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderError = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Catalog</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => {
            setError(null);
            loadAllData();
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          Retry
        </button>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">WALL CATALOG</div>
            <div className="flex items-center gap-8">
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 font-medium text-lg">Loading catalog...</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🏠</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No Designs Found</h3>
      <p className="text-gray-600 mb-6">
        {selectedMaterials.length > 0 || selectedTags.length > 0 || selectedSpace
          ? 'Try adjusting your filters to see more results.'
          : 'No designs available at the moment. Check back soon!'}
      </p>
      {(selectedMaterials.length > 0 || selectedTags.length > 0 || selectedSpace) && (
        <button
          onClick={clearAllFilters}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  if (error) return renderError();
  if (loading) return renderLoading();

  const activeFiltersCount = selectedMaterials.length + selectedTags.length + (selectedSpace ? 1 : 0);

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

      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Active Filters Badge */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </span>
              {selectedSpace && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {SPACE_CATEGORIES.find(s => s.id === selectedSpace)?.name}
                </span>
              )}
              {selectedMaterials.map(slug => (
                <span key={slug} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {materials.find(m => m.slug === slug)?.name || slug}
                </span>
              ))}
              {selectedTags.map(slug => (
                <span key={slug} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {tags.find(t => t.slug === slug)?.name || slug}
                </span>
              ))}
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Section 1: Explore By Space */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
            Explore By Space
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SPACE_CATEGORIES.map((space) => (
              <button
                key={space.id}
                onClick={() => setSelectedSpace(selectedSpace === space.id ? null : space.id)}
                className={`group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${
                  selectedSpace === space.id ? 'ring-2 ring-gray-900 ring-offset-2 scale-105' : ''
                }`}
              >
                <div className="aspect-[4/3] relative">
                  <img
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-all ${
                    selectedSpace === space.id ? 'from-blue-600/70' : ''
                  }`}></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-base" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
                      {space.name}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: Explore By Look (Materials) */}
        {materials.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
              Explore By Look
            </h2>
            
            <div className="relative">
              {/* Left Arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollMaterialSlider('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-900" />
                </button>
              )}

              {/* Slider */}
              <div
                ref={materialSliderRef}
                onScroll={handleSliderScroll}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {materials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => toggleMaterial(material.slug)}
                    className={`flex-shrink-0 w-40 group ${
                      selectedMaterials.includes(material.slug) ? 'ring-2 ring-gray-900 ring-offset-2' : ''
                    }`}
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all mb-3">
                      <img
                        src={material.image_url || 'https://via.placeholder.com/200?text=' + material.name}
                        alt={material.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className={`text-center font-medium ${
                      selectedMaterials.includes(material.slug) ? 'text-gray-900' : 'text-gray-700'
                    }`} style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
                      {material.name}
                    </h3>
                  </button>
                ))}
              </div>

              {/* Right Arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scrollMaterialSlider('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-6 h-6 text-gray-900" />
                </button>
              )}
            </div>
          </section>
        )}

        {/* Section 3: Filter By Tags */}
        {tags.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
              Filter By Style
            </h2>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.slug)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag.slug)
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-900'
                  }`}
                  style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Design Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
              {selectedSpace 
                ? `${SPACE_CATEGORIES.find(s => s.id === selectedSpace)?.name} Designs`
                : 'All Designs'}
            </h2>
            <p className="text-gray-600">
              {designs.length} design{designs.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {designs.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => {
                const images = getDesignImages(design);
                const currentIndex = imageIndexes[design.id] || 0;
                const isFavorite = favorites.includes(design.id);

                return (
                  <Link
                    key={design.id}
                    href={`/design/${design.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={images[currentIndex]}
                        alt={design.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Image Navigation */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => prevImage(design.id, e)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-900" />
                          </button>
                          <button
                            onClick={(e) => nextImage(design.id, e)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-900" />
                          </button>
                          
                          {/* Image Indicators */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(design.id);
                        }}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors" style={{ fontFamily: 'SF Pro Display, Inter, system-ui, sans-serif' }}>
                        {design.name}
                      </h3>
                      {design.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {design.description}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {(design.tag_slugs?.length > 0 || design.material_slugs?.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                          {design.material_slugs?.slice(0, 2).map((slug) => {
                            const material = materials.find(m => m.slug === slug);
                            return material ? (
                              <span
                                key={slug}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                {material.name}
                              </span>
                            ) : null;
                          })}
                          {design.tag_slugs?.slice(0, 2).map((slug) => {
                            const tag = tags.find(t => t.slug === slug);
                            return tag ? (
                              <span
                                key={slug}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                              >
                                {tag.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
