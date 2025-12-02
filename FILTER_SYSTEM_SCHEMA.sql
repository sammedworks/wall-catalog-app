-- ============================================
-- HORIZONTAL FILTER SYSTEM - DATABASE SCHEMA
-- ============================================
-- Admin-controlled filter tabs and chips

-- ============================================
-- 1. FILTER_TABS TABLE (Main Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS filter_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Display
  name TEXT NOT NULL, -- 'All looks', 'Wood', 'Marble', etc.
  slug TEXT NOT NULL UNIQUE, -- 'all-looks', 'wood', 'marble'
  icon TEXT, -- Optional icon name or emoji
  
  -- Filtering
  filter_type TEXT NOT NULL, -- 'all', 'material', 'style', 'custom'
  filter_key TEXT, -- Database column to filter: 'material_slugs', 'tag_slugs', etc.
  filter_value TEXT, -- Value to match: 'wood', 'marble', etc.
  
  -- Display Order
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- Is this the default tab?
  
  -- Metadata
  description TEXT,
  color_code TEXT DEFAULT '#6B7280',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-generate slug
CREATE OR REPLACE FUNCTION generate_filter_tab_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER filter_tab_slug_trigger
BEFORE INSERT OR UPDATE ON filter_tabs
FOR EACH ROW
EXECUTE FUNCTION generate_filter_tab_slug();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_filter_tabs_active ON filter_tabs(is_active);
CREATE INDEX IF NOT EXISTS idx_filter_tabs_order ON filter_tabs(display_order);
CREATE INDEX IF NOT EXISTS idx_filter_tabs_type ON filter_tabs(filter_type);

-- ============================================
-- 2. FILTER_CHIPS TABLE (Sub-filters)
-- ============================================
CREATE TABLE IF NOT EXISTS filter_chips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Display
  name TEXT NOT NULL, -- 'Filter', 'Economy', 'Luxe', etc.
  slug TEXT NOT NULL UNIQUE, -- 'filter', 'economy', 'luxe'
  icon TEXT, -- Optional icon
  
  -- Filtering
  filter_type TEXT NOT NULL, -- 'price', 'style', 'feature', 'custom'
  filter_key TEXT NOT NULL, -- 'price_range', 'tag_slugs', 'features', etc.
  filter_value JSONB, -- Flexible value: "economy" or {"min": 300, "max": 500}
  filter_operator TEXT DEFAULT 'equals', -- 'equals', 'contains', 'range', 'in'
  
  -- Grouping (optional)
  group_name TEXT, -- 'Price', 'Style', 'Lighting', etc.
  
  -- Display Order
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  description TEXT,
  color_code TEXT DEFAULT '#6B7280',
  badge_text TEXT, -- Optional badge: 'New', 'Popular', etc.
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-generate slug
CREATE OR REPLACE FUNCTION generate_filter_chip_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER filter_chip_slug_trigger
BEFORE INSERT OR UPDATE ON filter_chips
FOR EACH ROW
EXECUTE FUNCTION generate_filter_chip_slug();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_filter_chips_active ON filter_chips(is_active);
CREATE INDEX IF NOT EXISTS idx_filter_chips_order ON filter_chips(display_order);
CREATE INDEX IF NOT EXISTS idx_filter_chips_type ON filter_chips(filter_type);
CREATE INDEX IF NOT EXISTS idx_filter_chips_group ON filter_chips(group_name);

-- ============================================
-- 3. FILTER_PRESETS TABLE (Saved Combinations)
-- ============================================
CREATE TABLE IF NOT EXISTS filter_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Display
  name TEXT NOT NULL, -- 'Modern Living Room', 'Luxury Bedroom', etc.
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Filter Combination
  tab_slug TEXT, -- Which tab this preset belongs to
  chip_slugs TEXT[], -- Array of chip slugs: ['economy', 'minimal']
  custom_filters JSONB, -- Additional custom filters
  
  -- Display
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_filter_presets_active ON filter_presets(is_active);
CREATE INDEX IF NOT EXISTS idx_filter_presets_featured ON filter_presets(is_featured);

-- ============================================
-- SEED DATA - DEFAULT FILTERS
-- ============================================

-- Insert Filter Tabs
INSERT INTO filter_tabs (name, filter_type, filter_key, filter_value, display_order, is_default) VALUES
  ('All looks', 'all', NULL, NULL, 1, true),
  ('Wood', 'material', 'material_slugs', 'wooden', 2, false),
  ('Marble', 'material', 'material_slugs', 'marble', 3, false),
  ('Rattan', 'material', 'material_slugs', 'rattan', 4, false),
  ('Fabric', 'material', 'material_slugs', 'fabric', 5, false),
  ('Waffle', 'material', 'material_slugs', 'waffle', 6, false),
  ('Grey', 'material', 'material_slugs', 'grey', 7, false),
  ('White', 'material', 'material_slugs', 'white', 8, false),
  ('Glass', 'material', 'material_slugs', 'glass', 9, false),
  ('Metal', 'material', 'material_slugs', 'metal', 10, false)
ON CONFLICT (slug) DO NOTHING;

-- Insert Filter Chips
INSERT INTO filter_chips (name, filter_type, filter_key, filter_value, filter_operator, group_name, display_order) VALUES
  -- Price Range Chips
  ('Economy', 'price', 'price_per_sqft', '{"min": 0, "max": 400}', 'range', 'Price', 1),
  ('Luxe', 'price', 'price_per_sqft', '{"min": 500, "max": 999999}', 'range', 'Price', 2),
  
  -- Style Chips
  ('Minimal', 'style', 'tag_slugs', '"minimal"', 'contains', 'Style', 3),
  ('Statement', 'style', 'tag_slugs', '"statement"', 'contains', 'Style', 4),
  
  -- Lighting Chips
  ('Cove light', 'feature', 'tag_slugs', '"cove-light"', 'contains', 'Lighting', 5),
  ('Profile light', 'feature', 'tag_slugs', '"profile-light"', 'contains', 'Lighting', 6),
  ('Wall washer light', 'feature', 'tag_slugs', '"wall-washer-light"', 'contains', 'Lighting', 7),
  
  -- Additional Chips
  ('Modern', 'style', 'tag_slugs', '"modern"', 'contains', 'Style', 8),
  ('Classic', 'style', 'tag_slugs', '"classic"', 'contains', 'Style', 9),
  ('Luxury', 'style', 'tag_slugs', '"luxury"', 'contains', 'Style', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ADMIN HELPER VIEWS
-- ============================================

-- View: Active Filters Configuration
CREATE OR REPLACE VIEW active_filters_config AS
SELECT 
  'tabs' as filter_category,
  json_agg(
    json_build_object(
      'id', id,
      'name', name,
      'slug', slug,
      'filterType', filter_type,
      'filterKey', filter_key,
      'filterValue', filter_value,
      'displayOrder', display_order,
      'isDefault', is_default,
      'colorCode', color_code
    ) ORDER BY display_order
  ) as config
FROM filter_tabs
WHERE is_active = true

UNION ALL

SELECT 
  'chips' as filter_category,
  json_agg(
    json_build_object(
      'id', id,
      'name', name,
      'slug', slug,
      'filterType', filter_type,
      'filterKey', filter_key,
      'filterValue', filter_value,
      'filterOperator', filter_operator,
      'groupName', group_name,
      'displayOrder', display_order,
      'colorCode', color_code,
      'badgeText', badge_text
    ) ORDER BY display_order
  ) as config
FROM filter_chips
WHERE is_active = true;

-- ============================================
-- API HELPER FUNCTIONS
-- ============================================

-- Function: Get Filter Configuration (for frontend)
CREATE OR REPLACE FUNCTION get_filter_config()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'tabs', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'name', name,
          'slug', slug,
          'filterType', filter_type,
          'filterKey', filter_key,
          'filterValue', filter_value,
          'displayOrder', display_order,
          'isDefault', is_default,
          'colorCode', color_code,
          'icon', icon
        ) ORDER BY display_order
      )
      FROM filter_tabs
      WHERE is_active = true
    ),
    'chips', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'name', name,
          'slug', slug,
          'filterType', filter_type,
          'filterKey', filter_key,
          'filterValue', filter_value,
          'filterOperator', filter_operator,
          'groupName', group_name,
          'displayOrder', display_order,
          'colorCode', color_code,
          'badgeText', badge_text,
          'icon', icon
        ) ORDER BY display_order
      )
      FROM filter_chips
      WHERE is_active = true
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check filter tabs
SELECT 'Filter Tabs' as table_name, COUNT(*) as count FROM filter_tabs WHERE is_active = true;

-- Check filter chips
SELECT 'Filter Chips' as table_name, COUNT(*) as count FROM filter_chips WHERE is_active = true;

-- Get complete filter config
SELECT get_filter_config() as filter_configuration;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Filter system schema created!' as message;
SELECT '✅ 10 filter tabs added' as message;
SELECT '✅ 10 filter chips added' as message;
SELECT '✅ Admin-controlled filter system ready!' as message;
