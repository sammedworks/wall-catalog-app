'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * HorizontalFilterBar Component
 * 
 * Admin-controlled horizontal filter with tabs and chips
 * Supports query param sync, horizontal scroll, and auto-filtering
 * 
 * Props:
 * - onFilterChange: (filters) => void - Callback when filters change
 * - className: string - Additional CSS classes
 */
export default function HorizontalFilterBar({ onFilterChange, className = '' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [tabs, setTabs] = useState([]);
  const [chips, setChips] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [activeChips, setActiveChips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Refs for horizontal scroll
  const tabsRef = useRef(null);
  const chipsRef = useRef(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);
  const [canScrollChipsLeft, setCanScrollChipsLeft] = useState(false);
  const [canScrollChipsRight, setCanScrollChipsRight] = useState(false);

  // Load filter configuration from database
  useEffect(() => {
    loadFilterConfig();
  }, []);

  // Sync with URL query params on mount
  useEffect(() => {
    if (tabs.length > 0 && chips.length > 0) {
      syncFromQueryParams();
    }
  }, [tabs, chips, searchParams]);

  // Check scroll buttons visibility
  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [tabs, chips]);

  // Notify parent when filters change
  useEffect(() => {
    if (activeTab || activeChips.length > 0) {
      const filters = buildFilters();
      onFilterChange?.(filters);
    }
  }, [activeTab, activeChips]);

  /**
   * Load filter configuration from Supabase
   */
  const loadFilterConfig = async () => {
    try {
      setLoading(true);
      
      // Call Supabase function to get filter config
      const { data, error } = await supabase.rpc('get_filter_config');
      
      if (error) throw error;
      
      const config = data || { tabs: [], chips: [] };
      
      setTabs(config.tabs || []);
      setChips(config.chips || []);
      
      // Set default tab
      const defaultTab = config.tabs?.find(t => t.isDefault) || config.tabs?.[0];
      if (defaultTab) {
        setActiveTab(defaultTab.slug);
      }
    } catch (error) {
      console.error('Error loading filter config:', error);
      
      // Fallback to hardcoded config if database fails
      loadFallbackConfig();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fallback configuration if database is unavailable
   */
  const loadFallbackConfig = () => {
    setTabs([
      { id: '1', name: 'All looks', slug: 'all-looks', filterType: 'all', isDefault: true },
      { id: '2', name: 'Wood', slug: 'wood', filterType: 'material', filterKey: 'material_slugs', filterValue: 'wooden' },
      { id: '3', name: 'Marble', slug: 'marble', filterType: 'material', filterKey: 'material_slugs', filterValue: 'marble' },
      { id: '4', name: 'Rattan', slug: 'rattan', filterType: 'material', filterKey: 'material_slugs', filterValue: 'rattan' },
      { id: '5', name: 'Fabric', slug: 'fabric', filterType: 'material', filterKey: 'material_slugs', filterValue: 'fabric' },
    ]);
    
    setChips([
      { id: '1', name: 'Economy', slug: 'economy', filterType: 'price', filterKey: 'price_per_sqft', filterValue: { min: 0, max: 400 }, filterOperator: 'range' },
      { id: '2', name: 'Luxe', slug: 'luxe', filterType: 'price', filterKey: 'price_per_sqft', filterValue: { min: 500, max: 999999 }, filterOperator: 'range' },
      { id: '3', name: 'Minimal', slug: 'minimal', filterType: 'style', filterKey: 'tag_slugs', filterValue: 'minimal', filterOperator: 'contains' },
      { id: '4', name: 'Statement', slug: 'statement', filterType: 'style', filterKey: 'tag_slugs', filterValue: 'statement', filterOperator: 'contains' },
      { id: '5', name: 'Cove light', slug: 'cove-light', filterType: 'feature', filterKey: 'tag_slugs', filterValue: 'cove-light', filterOperator: 'contains' },
    ]);
    
    setActiveTab('all-looks');
  };

  /**
   * Sync filters from URL query parameters
   */
  const syncFromQueryParams = () => {
    const tab = searchParams.get('tab');
    const chipsParam = searchParams.get('chips');
    
    if (tab && tabs.find(t => t.slug === tab)) {
      setActiveTab(tab);
    }
    
    if (chipsParam) {
      const chipSlugs = chipsParam.split(',');
      const validChips = chipSlugs.filter(slug => chips.find(c => c.slug === slug));
      setActiveChips(validChips);
    }
  };

  /**
   * Update URL query parameters
   */
  const updateQueryParams = (tab, chipsList) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (tab && tab !== 'all-looks') {
      params.set('tab', tab);
    } else {
      params.delete('tab');
    }
    
    if (chipsList && chipsList.length > 0) {
      params.set('chips', chipsList.join(','));
    } else {
      params.delete('chips');
    }
    
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname, { scroll: false });
  };

  /**
   * Build filter object for database query
   */
  const buildFilters = () => {
    const filters = {};
    
    // Add tab filter
    if (activeTab && activeTab !== 'all-looks') {
      const tab = tabs.find(t => t.slug === activeTab);
      if (tab && tab.filterKey && tab.filterValue) {
        filters[tab.filterKey] = tab.filterValue;
      }
    }
    
    // Add chip filters
    activeChips.forEach(chipSlug => {
      const chip = chips.find(c => c.slug === chipSlug);
      if (chip && chip.filterKey) {
        const key = chip.filterKey;
        const value = chip.filterValue;
        const operator = chip.filterOperator || 'equals';
        
        if (operator === 'range') {
          filters[key] = { ...filters[key], ...value };
        } else if (operator === 'contains') {
          if (!filters[key]) filters[key] = [];
          filters[key].push(value);
        } else {
          filters[key] = value;
        }
      }
    });
    
    return filters;
  };

  /**
   * Handle tab click
   */
  const handleTabClick = (tabSlug) => {
    setActiveTab(tabSlug);
    updateQueryParams(tabSlug, activeChips);
  };

  /**
   * Handle chip click
   */
  const handleChipClick = (chipSlug) => {
    let newChips;
    
    if (activeChips.includes(chipSlug)) {
      // Remove chip
      newChips = activeChips.filter(slug => slug !== chipSlug);
    } else {
      // Add chip
      newChips = [...activeChips, chipSlug];
    }
    
    setActiveChips(newChips);
    updateQueryParams(activeTab, newChips);
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    const defaultTab = tabs.find(t => t.isDefault)?.slug || 'all-looks';
    setActiveTab(defaultTab);
    setActiveChips([]);
    updateQueryParams(defaultTab, []);
  };

  /**
   * Scroll tabs/chips horizontally
   */
  const scroll = (ref, direction) => {
    if (!ref.current) return;
    
    const scrollAmount = 200;
    const newScrollLeft = ref.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    ref.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  /**
   * Check if scroll buttons should be visible
   */
  const checkScrollButtons = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollTabsLeft(scrollLeft > 0);
      setCanScrollTabsRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
    
    if (chipsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = chipsRef.current;
      setCanScrollChipsLeft(scrollLeft > 0);
      setCanScrollChipsRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg mb-4 w-full"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-b border-gray-200 sticky top-[73px] z-40 ${className}`}>
      <div className="max-w-[1400px] mx-auto px-8 py-4">
        {/* Tabs Row */}
        <div className="relative group mb-4">
          {/* Left Scroll Button */}
          {canScrollTabsLeft && (
            <button
              onClick={() => scroll(tabsRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
              style={{ marginLeft: '-16px' }}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Tabs Container */}
          <div
            ref={tabsRef}
            onScroll={checkScrollButtons}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.slug)}
                className={`
                  flex-shrink-0 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200
                  ${activeTab === tab.slug
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                style={activeTab === tab.slug && tab.colorCode ? { backgroundColor: tab.colorCode } : {}}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.name}
              </button>
            ))}
          </div>

          {/* Right Scroll Button */}
          {canScrollTabsRight && (
            <button
              onClick={() => scroll(tabsRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
              style={{ marginRight: '-16px' }}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>

        {/* Chips Row */}
        <div className="relative group">
          {/* Left Scroll Button */}
          {canScrollChipsLeft && (
            <button
              onClick={() => scroll(chipsRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
              style={{ marginLeft: '-16px' }}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Chips Container */}
          <div
            ref={chipsRef}
            onScroll={checkScrollButtons}
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {chips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleChipClick(chip.slug)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative
                  ${activeChips.includes(chip.slug)
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }
                `}
                style={activeChips.includes(chip.slug) && chip.colorCode ? { backgroundColor: chip.colorCode } : {}}
              >
                {chip.icon && <span className="mr-1.5">{chip.icon}</span>}
                {chip.name}
                {chip.badgeText && (
                  <span className="ml-1.5 text-xs bg-white/20 px-1.5 py-0.5 rounded">
                    {chip.badgeText}
                  </span>
                )}
              </button>
            ))}
            
            {/* Clear All Button */}
            {activeChips.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          {/* Right Scroll Button */}
          {canScrollChipsRight && (
            <button
              onClick={() => scroll(chipsRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
              style={{ marginRight: '-16px' }}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>

        {/* Active Filters Summary */}
        {(activeTab !== 'all-looks' || activeChips.length > 0) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>
            {activeTab !== 'all-looks' && (
              <span className="px-2 py-1 bg-gray-100 rounded-md">
                {tabs.find(t => t.slug === activeTab)?.name}
              </span>
            )}
            {activeChips.map(chipSlug => {
              const chip = chips.find(c => c.slug === chipSlug);
              return chip ? (
                <span key={chipSlug} className="px-2 py-1 bg-gray-100 rounded-md flex items-center gap-1">
                  {chip.name}
                  <button
                    onClick={() => handleChipClick(chipSlug)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Hide scrollbar globally */}
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
