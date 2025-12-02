/**
 * Filter Utility Functions
 * 
 * Backend filtering logic for horizontal filter system
 * Converts filter configuration to Supabase queries
 */

import { supabase } from './supabase';

/**
 * Build Supabase query from filter configuration
 * 
 * @param {Object} filters - Filter object from HorizontalFilterBar
 * @returns {Object} Supabase query builder
 * 
 * Example filters object:
 * {
 *   material_slugs: 'wooden',
 *   tag_slugs: ['minimal', 'modern'],
 *   price_per_sqft: { min: 300, max: 500 }
 * }
 */
export function buildFilterQuery(filters = {}) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;

    // Handle array contains (for material_slugs, tag_slugs)
    if (Array.isArray(value)) {
      // Multiple values - match any
      value.forEach(val => {
        query = query.contains(key, [val]);
      });
    }
    // Handle single string value (for material_slugs, tag_slugs)
    else if (typeof value === 'string') {
      query = query.contains(key, [value]);
    }
    // Handle range (for price_per_sqft)
    else if (typeof value === 'object' && (value.min !== undefined || value.max !== undefined)) {
      if (value.min !== undefined) {
        query = query.gte(key, value.min);
      }
      if (value.max !== undefined) {
        query = query.lte(key, value.max);
      }
    }
    // Handle exact match
    else {
      query = query.eq(key, value);
    }
  });

  return query;
}

/**
 * Apply filters to products
 * 
 * @param {Object} filters - Filter configuration
 * @param {Object} options - Additional options (sort, limit, offset)
 * @returns {Promise<Array>} Filtered products
 */
export async function filterProducts(filters = {}, options = {}) {
  try {
    let query = buildFilterQuery(filters);

    // Apply sorting
    if (options.sortBy) {
      query = query.order(options.sortBy, { 
        ascending: options.sortOrder === 'asc' 
      });
    } else {
      // Default sort
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      products: data || [],
      total: count || data?.length || 0,
      hasMore: options.limit ? (data?.length || 0) >= options.limit : false
    };
  } catch (error) {
    console.error('Error filtering products:', error);
    throw error;
  }
}

/**
 * Get filter counts for each filter option
 * Useful for showing "(45)" next to filter options
 * 
 * @returns {Promise<Object>} Filter counts
 */
export async function getFilterCounts() {
  try {
    // Get all active products
    const { data: products, error } = await supabase
      .from('products')
      .select('material_slugs, tag_slugs, price_per_sqft, space_category')
      .eq('is_active', true);

    if (error) throw error;

    const counts = {
      materials: {},
      tags: {},
      spaces: {},
      priceRanges: {
        economy: 0,    // 0-400
        mid: 0,        // 400-500
        luxe: 0        // 500+
      }
    };

    products.forEach(product => {
      // Count materials
      if (product.material_slugs) {
        product.material_slugs.forEach(material => {
          counts.materials[material] = (counts.materials[material] || 0) + 1;
        });
      }

      // Count tags
      if (product.tag_slugs) {
        product.tag_slugs.forEach(tag => {
          counts.tags[tag] = (counts.tags[tag] || 0) + 1;
        });
      }

      // Count spaces
      if (product.space_category) {
        counts.spaces[product.space_category] = (counts.spaces[product.space_category] || 0) + 1;
      }

      // Count price ranges
      const price = product.price_per_sqft;
      if (price) {
        if (price <= 400) counts.priceRanges.economy++;
        else if (price <= 500) counts.priceRanges.mid++;
        else counts.priceRanges.luxe++;
      }
    });

    return counts;
  } catch (error) {
    console.error('Error getting filter counts:', error);
    return {
      materials: {},
      tags: {},
      spaces: {},
      priceRanges: { economy: 0, mid: 0, luxe: 0 }
    };
  }
}

/**
 * Parse URL query parameters to filter object
 * 
 * @param {URLSearchParams} searchParams - Next.js searchParams
 * @returns {Object} Filter object
 */
export function parseQueryParamsToFilters(searchParams) {
  const filters = {};

  // Get tab filter
  const tab = searchParams.get('tab');
  if (tab && tab !== 'all-looks') {
    // This would need to be mapped to actual filter keys
    // For now, assume tab is a material slug
    filters.material_slugs = tab;
  }

  // Get chip filters
  const chips = searchParams.get('chips');
  if (chips) {
    const chipSlugs = chips.split(',');
    
    // Map chip slugs to filter keys
    // This mapping should come from the database
    chipSlugs.forEach(slug => {
      if (slug === 'economy') {
        filters.price_per_sqft = { min: 0, max: 400 };
      } else if (slug === 'luxe') {
        filters.price_per_sqft = { min: 500, max: 999999 };
      } else {
        // Assume it's a tag
        if (!filters.tag_slugs) filters.tag_slugs = [];
        filters.tag_slugs.push(slug);
      }
    });
  }

  // Get space filter
  const space = searchParams.get('space');
  if (space) {
    filters.space_category = space;
  }

  return filters;
}

/**
 * Validate filter configuration
 * 
 * @param {Object} filters - Filter object
 * @returns {Boolean} Is valid
 */
export function validateFilters(filters) {
  if (!filters || typeof filters !== 'object') return false;

  // Check for valid filter keys
  const validKeys = [
    'material_slugs',
    'tag_slugs',
    'space_category',
    'price_per_sqft',
    'finish_type',
    'is_featured'
  ];

  return Object.keys(filters).every(key => validKeys.includes(key));
}

/**
 * Merge multiple filter objects
 * 
 * @param {...Object} filterObjects - Multiple filter objects
 * @returns {Object} Merged filters
 */
export function mergeFilters(...filterObjects) {
  const merged = {};

  filterObjects.forEach(filters => {
    if (!filters) return;

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Merge arrays
        merged[key] = [...(merged[key] || []), ...value];
      } else if (typeof value === 'object' && value !== null) {
        // Merge objects (like price ranges)
        merged[key] = { ...(merged[key] || {}), ...value };
      } else {
        // Overwrite simple values
        merged[key] = value;
      }
    });
  });

  return merged;
}

/**
 * Get similar products based on filters
 * 
 * @param {String} productId - Current product ID
 * @param {Number} limit - Number of similar products
 * @returns {Promise<Array>} Similar products
 */
export async function getSimilarProducts(productId, limit = 4) {
  try {
    // Get current product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('material_slugs, tag_slugs, space_category')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    // Build filters for similar products
    const filters = {};
    
    if (product.material_slugs && product.material_slugs.length > 0) {
      filters.material_slugs = product.material_slugs[0];
    }
    
    if (product.space_category) {
      filters.space_category = product.space_category;
    }

    // Get similar products
    let query = buildFilterQuery(filters);
    query = query
      .neq('id', productId) // Exclude current product
      .limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting similar products:', error);
    return [];
  }
}

/**
 * Export filter configuration for frontend
 * 
 * @returns {Promise<Object>} Filter configuration
 */
export async function getFilterConfiguration() {
  try {
    const { data, error } = await supabase.rpc('get_filter_config');
    
    if (error) throw error;
    
    return data || { tabs: [], chips: [] };
  } catch (error) {
    console.error('Error getting filter configuration:', error);
    
    // Return fallback configuration
    return {
      tabs: [
        { id: '1', name: 'All looks', slug: 'all-looks', filterType: 'all', isDefault: true }
      ],
      chips: []
    };
  }
}
