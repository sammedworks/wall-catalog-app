-- =====================================================
-- DESIGN LIBRARY DATABASE SCHEMA
-- =====================================================
-- Creates comprehensive schema for Design Library module
-- Includes: designs, categories, tags, media, pricing, products
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. DESIGN CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS design_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100), -- Icon name/class
  color_code VARCHAR(7), -- Hex color
  parent_id UUID REFERENCES design_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_design_categories_slug ON design_categories(slug);
CREATE INDEX idx_design_categories_parent ON design_categories(parent_id);
CREATE INDEX idx_design_categories_active ON design_categories(is_active);

-- =====================================================
-- 2. DESIGN TAGS
-- =====================================================
CREATE TABLE IF NOT EXISTS design_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color_code VARCHAR(7),
  tag_group VARCHAR(100), -- Material, Style, Price Tier, etc.
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_design_tags_slug ON design_tags(slug);
CREATE INDEX idx_design_tags_group ON design_tags(tag_group);
CREATE INDEX idx_design_tags_active ON design_tags(is_active);

-- =====================================================
-- 3. AREA TYPES (TV Unit, Living Room, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS area_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_area_types_slug ON area_types(slug);
CREATE INDEX idx_area_types_active ON area_types(is_active);

-- Insert default area types
INSERT INTO area_types (name, slug, description, display_order) VALUES
  ('TV Unit', 'tv-unit', 'Television unit and entertainment center designs', 1),
  ('Living Room', 'living-room', 'Complete living room interior designs', 2),
  ('Bedroom', 'bedroom', 'Bedroom interior and furniture designs', 3),
  ('Entrance', 'entrance', 'Entrance and foyer designs', 4),
  ('Study', 'study', 'Study room and home office designs', 5),
  ('Mandir', 'mandir', 'Prayer room and mandir designs', 6),
  ('Kitchen', 'kitchen', 'Kitchen and dining area designs', 7),
  ('Bathroom', 'bathroom', 'Bathroom interior designs', 8)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 4. DESIGN LIBRARY (Main Table)
-- =====================================================
CREATE TABLE IF NOT EXISTS designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  short_description TEXT,
  long_description TEXT, -- Rich text/HTML
  sku VARCHAR(100) UNIQUE,
  
  -- Classification
  area_type_id UUID REFERENCES area_types(id) ON DELETE SET NULL,
  category_id UUID REFERENCES design_categories(id) ON DELETE SET NULL,
  
  -- Pricing
  starting_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  rate_per_sqft DECIMAL(10, 2),
  pricing_type VARCHAR(50) DEFAULT 'fixed', -- fixed, per_sqft, custom
  
  -- Attributes
  materials JSONB DEFAULT '[]', -- Array of material names
  style VARCHAR(100), -- Modern, Traditional, Minimal, etc.
  lighting_type VARCHAR(100),
  level VARCHAR(50), -- economy, luxe, minimal, statement
  
  -- Dimensions
  min_area_sqft DECIMAL(10, 2),
  max_area_sqft DECIMAL(10, 2),
  recommended_dimensions JSONB, -- {width, height, depth}
  
  -- Media
  hero_image_url TEXT,
  hero_image_order JSONB DEFAULT '[]', -- Array of image URLs in order
  gallery_images JSONB DEFAULT '[]', -- Array of image objects
  video_url TEXT,
  
  -- SEO
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT,
  
  -- Publishing
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES designs(id) ON DELETE SET NULL,
  
  -- Metadata
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  
  -- Audit
  created_by UUID, -- Reference to users table
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_designs_slug ON designs(slug);
CREATE INDEX idx_designs_sku ON designs(sku);
CREATE INDEX idx_designs_status ON designs(status);
CREATE INDEX idx_designs_area_type ON designs(area_type_id);
CREATE INDEX idx_designs_category ON designs(category_id);
CREATE INDEX idx_designs_featured ON designs(is_featured);
CREATE INDEX idx_designs_published ON designs(published_at);
CREATE INDEX idx_designs_price ON designs(starting_price);
CREATE INDEX idx_designs_created ON designs(created_at DESC);

-- Full-text search index
CREATE INDEX idx_designs_search ON designs USING gin(
  to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(short_description, '') || ' ' || 
    COALESCE(sku, '')
  )
);

-- =====================================================
-- 5. DESIGN-TAG RELATIONSHIP (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS design_tag_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES design_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(design_id, tag_id)
);

CREATE INDEX idx_design_tags_design ON design_tag_relations(design_id);
CREATE INDEX idx_design_tags_tag ON design_tag_relations(tag_id);

-- =====================================================
-- 6. DESIGN MEDIA LIBRARY
-- =====================================================
CREATE TABLE IF NOT EXISTS design_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
  
  -- File Info
  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- image, video, document
  mime_type VARCHAR(100),
  file_size_kb INTEGER,
  
  -- Image Specific
  width INTEGER,
  height INTEGER,
  thumbnail_url TEXT,
  medium_url TEXT,
  large_url TEXT,
  
  -- Metadata
  alt_text TEXT,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Audit
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_design_media_design ON design_media(design_id);
CREATE INDEX idx_design_media_type ON design_media(file_type);
CREATE INDEX idx_design_media_primary ON design_media(is_primary);

-- =====================================================
-- 7. DESIGN-PRODUCT ASSOCIATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS design_product_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  product_id UUID, -- Reference to products table (to be created)
  
  -- Association Details
  product_type VARCHAR(100), -- furniture, lighting, accessory, addon
  quantity INTEGER DEFAULT 1,
  position_metadata JSONB, -- {x, y, z} coordinates or room position
  is_optional BOOLEAN DEFAULT false,
  
  -- Pricing Override
  override_price DECIMAL(10, 2),
  pricing_formula TEXT, -- For sqft-based pricing
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_design_products_design ON design_product_relations(design_id);
CREATE INDEX idx_design_products_product ON design_product_relations(product_id);

-- =====================================================
-- 8. PRICING RULES
-- =====================================================
CREATE TABLE IF NOT EXISTS design_pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Rule Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type VARCHAR(50), -- discount, bulk, seasonal, custom
  
  -- Applicability
  applies_to VARCHAR(50), -- all, category, tag, specific_design
  target_ids JSONB DEFAULT '[]', -- Array of category/tag/design IDs
  
  -- Rule Logic
  condition_type VARCHAR(50), -- min_quantity, date_range, area_range
  condition_value JSONB, -- Flexible condition data
  
  -- Discount
  discount_type VARCHAR(50), -- percentage, fixed_amount, formula
  discount_value DECIMAL(10, 2),
  discount_formula TEXT,
  
  -- Validity
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority rules apply first
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pricing_rules_type ON design_pricing_rules(rule_type);
CREATE INDEX idx_pricing_rules_active ON design_pricing_rules(is_active);
CREATE INDEX idx_pricing_rules_validity ON design_pricing_rules(valid_from, valid_until);

-- =====================================================
-- 9. DESIGN ACTIVITY LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS design_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
  
  -- Activity Details
  action VARCHAR(100) NOT NULL, -- created, updated, published, deleted, viewed
  action_by UUID, -- User ID
  action_by_name VARCHAR(255),
  action_by_email VARCHAR(255),
  
  -- Changes
  changes JSONB, -- Before/after values
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_design_activity_design ON design_activity_log(design_id);
CREATE INDEX idx_design_activity_action ON design_activity_log(action);
CREATE INDEX idx_design_activity_user ON design_activity_log(action_by);
CREATE INDEX idx_design_activity_created ON design_activity_log(created_at DESC);

-- =====================================================
-- 10. DESIGN ANALYTICS
-- =====================================================
CREATE TABLE IF NOT EXISTS design_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  
  -- Date
  date DATE NOT NULL,
  
  -- Metrics
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  quotation_requests INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  -- Engagement
  avg_time_spent_seconds INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5, 2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(design_id, date)
);

CREATE INDEX idx_design_analytics_design ON design_analytics(design_id);
CREATE INDEX idx_design_analytics_date ON design_analytics(date DESC);

-- =====================================================
-- 11. DESIGN SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS design_library_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type VARCHAR(50), -- string, number, boolean, json, array
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Can be accessed by front-end
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_design_settings_key ON design_library_settings(setting_key);
CREATE INDEX idx_design_settings_public ON design_library_settings(is_public);

-- Insert default settings
INSERT INTO design_library_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
  ('default_pricing_type', '"fixed"', 'string', 'Default pricing type for new designs', false),
  ('enable_versioning', 'true', 'boolean', 'Enable design versioning', false),
  ('max_images_per_design', '20', 'number', 'Maximum images allowed per design', false),
  ('auto_publish_enabled', 'false', 'boolean', 'Auto-publish designs after approval', false),
  ('featured_designs_limit', '10', 'number', 'Maximum featured designs on homepage', true),
  ('area_type_labels', '{"tv-unit": "TV Unit", "living-room": "Living Room"}', 'json', 'Customizable area type labels', true)
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 12. TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_design_categories_updated_at BEFORE UPDATE ON design_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_tags_updated_at BEFORE UPDATE ON design_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_area_types_updated_at BEFORE UPDATE ON area_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_designs_updated_at BEFORE UPDATE ON designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_media_updated_at BEFORE UPDATE ON design_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_product_relations_updated_at BEFORE UPDATE ON design_product_relations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_pricing_rules_updated_at BEFORE UPDATE ON design_pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_analytics_updated_at BEFORE UPDATE ON design_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_library_settings_updated_at BEFORE UPDATE ON design_library_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE design_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_product_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_library_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for published designs
CREATE POLICY "Public can view published designs" ON designs
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view active categories" ON design_categories
  FOR SELECT USING (is_active = true AND is_visible = true);

CREATE POLICY "Public can view active tags" ON design_tags
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active area types" ON area_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view design media" ON design_media
  FOR SELECT USING (
    design_id IN (SELECT id FROM designs WHERE status = 'published')
  );

CREATE POLICY "Public can view public settings" ON design_library_settings
  FOR SELECT USING (is_public = true);

-- Admin full access (authenticated users with admin role)
-- Note: Adjust based on your auth setup
CREATE POLICY "Authenticated users full access to designs" ON designs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to categories" ON design_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to tags" ON design_tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to area types" ON area_types
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to media" ON design_media
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to product relations" ON design_product_relations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to pricing rules" ON design_pricing_rules
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to activity log" ON design_activity_log
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to analytics" ON design_analytics
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to settings" ON design_library_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to tag relations" ON design_tag_relations
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 14. HELPER FUNCTIONS
-- =====================================================

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_design_views(design_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE designs 
  SET view_count = view_count + 1 
  WHERE id = design_uuid;
  
  -- Also update analytics
  INSERT INTO design_analytics (design_id, date, views, unique_views)
  VALUES (design_uuid, CURRENT_DATE, 1, 1)
  ON CONFLICT (design_id, date) 
  DO UPDATE SET 
    views = design_analytics.views + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to publish design
CREATE OR REPLACE FUNCTION publish_design(design_uuid UUID, publisher_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE designs 
  SET 
    status = 'published',
    published_at = NOW(),
    updated_by = publisher_uuid
  WHERE id = design_uuid;
  
  -- Log activity
  INSERT INTO design_activity_log (design_id, action, action_by)
  VALUES (design_uuid, 'published', publisher_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get design with full details
CREATE OR REPLACE FUNCTION get_design_full_details(design_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'design', row_to_json(d.*),
    'category', row_to_json(c.*),
    'area_type', row_to_json(a.*),
    'tags', (
      SELECT json_agg(row_to_json(t.*))
      FROM design_tags t
      INNER JOIN design_tag_relations dtr ON t.id = dtr.tag_id
      WHERE dtr.design_id = design_uuid
    ),
    'media', (
      SELECT json_agg(row_to_json(m.*))
      FROM design_media m
      WHERE m.design_id = design_uuid
      ORDER BY m.display_order
    ),
    'products', (
      SELECT json_agg(row_to_json(p.*))
      FROM design_product_relations p
      WHERE p.design_id = design_uuid
    )
  ) INTO result
  FROM designs d
  LEFT JOIN design_categories c ON d.category_id = c.id
  LEFT JOIN area_types a ON d.area_type_id = a.id
  WHERE d.id = design_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 15. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Sample categories
INSERT INTO design_categories (name, slug, description, color_code, display_order) VALUES
  ('Modern', 'modern', 'Contemporary and modern designs', '#3B82F6', 1),
  ('Traditional', 'traditional', 'Classic and traditional designs', '#EF4444', 2),
  ('Minimal', 'minimal', 'Minimalist and clean designs', '#10B981', 3),
  ('Luxury', 'luxury', 'Premium and luxury designs', '#F59E0B', 4)
ON CONFLICT (slug) DO NOTHING;

-- Sample tags
INSERT INTO design_tags (name, slug, tag_group, color_code, display_order) VALUES
  ('Wood', 'wood', 'Material', '#8B4513', 1),
  ('Glass', 'glass', 'Material', '#87CEEB', 2),
  ('Metal', 'metal', 'Material', '#C0C0C0', 3),
  ('Contemporary', 'contemporary', 'Style', '#3B82F6', 1),
  ('Rustic', 'rustic', 'Style', '#D2691E', 2),
  ('Economy', 'economy', 'Price Tier', '#10B981', 1),
  ('Premium', 'premium', 'Price Tier', '#F59E0B', 2),
  ('Luxury', 'luxury', 'Price Tier', '#EF4444', 3)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Design Library schema created successfully
-- Tables: 11 main tables + junction tables
-- Indexes: Optimized for search and filtering
-- RLS: Security policies for public and authenticated access
-- Functions: Helper functions for common operations
-- =====================================================
