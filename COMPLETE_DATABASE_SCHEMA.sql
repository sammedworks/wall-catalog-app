-- ============================================
-- WALL CATALOG APP - COMPLETE DATABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor
-- This creates all tables needed for the app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. MATERIALS TABLE (Slider/Looks)
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  color_code TEXT DEFAULT '#CCCCCC',
  text_color TEXT DEFAULT '#374151',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_material_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER material_slug_trigger
BEFORE INSERT OR UPDATE ON materials
FOR EACH ROW
EXECUTE FUNCTION generate_material_slug();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_materials_order ON materials(display_order);

-- ============================================
-- 2. PANELS TABLE (For Quotation Builder)
-- ============================================
CREATE TABLE IF NOT EXISTS panels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT, -- 'fluted', 'groove', 'texture', 'plain', etc.
  rate_per_sqft NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  specifications JSONB, -- {thickness: '8mm', material: 'MDF', finish: 'Laminate'}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-generate slug
CREATE OR REPLACE FUNCTION generate_panel_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER panel_slug_trigger
BEFORE INSERT OR UPDATE ON panels
FOR EACH ROW
EXECUTE FUNCTION generate_panel_slug();

CREATE INDEX IF NOT EXISTS idx_panels_active ON panels(is_active);
CREATE INDEX IF NOT EXISTS idx_panels_category ON panels(category);

-- ============================================
-- 3. ADDONS TABLE (For Quotation Builder)
-- ============================================
CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT, -- 'modular-furniture', 'lighting', 'hardware', etc.
  size TEXT, -- 'small', 'medium', 'large', 'custom'
  color_options TEXT[], -- ['white', 'black', 'wood', 'grey']
  base_price NUMERIC(10,2) NOT NULL,
  price_per_unit NUMERIC(10,2), -- For quantity-based pricing
  unit TEXT DEFAULT 'piece', -- 'piece', 'set', 'sqft', 'linear-ft'
  image_url TEXT,
  description TEXT,
  specifications JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addons_active ON addons(is_active);
CREATE INDEX IF NOT EXISTS idx_addons_category ON addons(category);

-- ============================================
-- 4. TAGS TABLE (For Design Filtering)
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT, -- 'style', 'color', 'mood', 'feature'
  description TEXT,
  color_code TEXT DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Auto-generate slug
CREATE OR REPLACE FUNCTION generate_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tag_slug_trigger
BEFORE INSERT OR UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION generate_tag_slug();

CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);

-- ============================================
-- 5. PRODUCTS TABLE (Designs/Catalog)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Categorization
  space_category TEXT, -- 'tv-unit', 'living-room', 'bedroom', etc.
  finish_type TEXT, -- 'matte', 'glossy', 'textured'
  
  -- Pricing
  price_per_sqft NUMERIC(10,2),
  estimated_cost NUMERIC(10,2), -- Optional: for fixed-price designs
  
  -- Images
  image_url TEXT,
  image_url_2 TEXT,
  image_url_3 TEXT,
  image_url_4 TEXT,
  thumbnail_url TEXT,
  
  -- Relations (stored as arrays for quick filtering)
  material_slugs TEXT[], -- ['marble', 'wood']
  tag_slugs TEXT[], -- ['modern', 'warm', 'luxury']
  panel_ids UUID[], -- [uuid1, uuid2] - panels used in this design
  
  -- Metadata
  dimensions JSONB, -- {width: 120, height: 240, depth: 30}
  specifications JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-generate slug
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_slug_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION generate_product_slug();

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_space ON products(space_category);
CREATE INDEX IF NOT EXISTS idx_products_materials ON products USING GIN(material_slugs);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tag_slugs);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- ============================================
-- 6. DESIGN_PANELS TABLE (Junction)
-- ============================================
CREATE TABLE IF NOT EXISTS design_panels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  design_id UUID REFERENCES products(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES panels(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(design_id, panel_id)
);

CREATE INDEX IF NOT EXISTS idx_design_panels_design ON design_panels(design_id);
CREATE INDEX IF NOT EXISTS idx_design_panels_panel ON design_panels(panel_id);

-- ============================================
-- 7. QUOTATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE, -- Auto: QT-2024-001
  
  -- Customer Info
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  
  -- Design Reference (optional)
  design_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Panels Selected
  panels JSONB, -- [{panel_id, name, rate, sqft, total}]
  
  -- Walls (max 4)
  walls JSONB, -- [{wall_number: 1, sqft: 120, panel_id: uuid}]
  total_sqft NUMERIC(10,2) DEFAULT 0,
  
  -- Addons
  addons JSONB, -- [{addon_id, name, color, size, quantity, price, total}]
  
  -- Calculations
  panel_cost NUMERIC(10,2) DEFAULT 0,
  addon_cost NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(10,2) DEFAULT 0,
  tax_percentage NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  discount_percentage NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_cost NUMERIC(10,2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected', 'expired'
  
  -- Sharing
  share_token TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  
  -- Notes
  notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  valid_until TIMESTAMP,
  sent_at TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
  year TEXT;
  count INTEGER;
  new_number TEXT;
BEGIN
  IF NEW.quote_number IS NULL OR NEW.quote_number = '' THEN
    year := TO_CHAR(NOW(), 'YYYY');
    SELECT COUNT(*) + 1 INTO count FROM quotations WHERE quote_number LIKE 'QT-' || year || '-%';
    new_number := 'QT-' || year || '-' || LPAD(count::TEXT, 4, '0');
    NEW.quote_number := new_number;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quote_number_trigger
BEFORE INSERT ON quotations
FOR EACH ROW
EXECUTE FUNCTION generate_quote_number();

-- Auto-generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_token IS NULL OR NEW.share_token = '' THEN
    NEW.share_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER share_token_trigger
BEFORE INSERT ON quotations
FOR EACH ROW
EXECUTE FUNCTION generate_share_token();

CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_email ON quotations(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotations_share_token ON quotations(share_token);

-- ============================================
-- 8. SLIDER_GROUPS TABLE (Material Collections)
-- ============================================
CREATE TABLE IF NOT EXISTS slider_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  material_ids UUID[], -- Array of material IDs in this group
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slider_groups_active ON slider_groups(is_active);

-- ============================================
-- 9. ADMIN_SETTINGS TABLE (UI Copy, Config)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  category TEXT, -- 'ui', 'pricing', 'email', 'general'
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO admin_settings (key, value, category, description) VALUES
  ('site_name', '"Wall Catalog"', 'ui', 'Website name'),
  ('site_tagline', '"Transform Your Space"', 'ui', 'Website tagline'),
  ('default_tax_rate', '18', 'pricing', 'Default tax percentage'),
  ('quote_validity_days', '30', 'pricing', 'Quote validity in days'),
  ('contact_email', '"info@wallcatalog.com"', 'general', 'Contact email'),
  ('contact_phone', '"+91 1234567890"', 'general', 'Contact phone')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 10. ACTIVITY_LOG TABLE (Admin Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Future: link to auth.users
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view'
  entity_type TEXT NOT NULL, -- 'product', 'panel', 'quotation', etc.
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default materials (10 materials)
INSERT INTO materials (name, description, thumbnail_url, color_code, display_order, is_featured) VALUES
  ('Marble', 'Elegant marble finish with natural veining', 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&h=400&fit=crop', '#F5E6D3', 1, true),
  ('Marble Luxe', 'Premium marble with gold accents', 'https://images.unsplash.com/photo-1618219944342-824e40a13285?w=400&h=400&fit=crop', '#E8DCC8', 2, true),
  ('Wooden', 'Natural wood grain texture', 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400&h=400&fit=crop', '#8B6F47', 3, true),
  ('Fabric', 'Soft fabric texture panels', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', '#D4C5B9', 4, false),
  ('Waffle', 'Textured waffle pattern', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=400&fit=crop', '#C8B8A8', 5, false),
  ('Grey', 'Modern grey finish', 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&h=400&fit=crop', '#9CA3AF', 6, false),
  ('White', 'Clean white panels', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=400&fit=crop', '#F9FAFB', 7, false),
  ('Glass', 'Transparent glass panels', 'https://images.unsplash.com/photo-1618219944342-824e40a13285?w=400&h=400&fit=crop', '#E0F2FE', 8, false),
  ('Metal', 'Industrial metal finish', 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&h=400&fit=crop', '#71717A', 9, false),
  ('Stone', 'Natural stone texture', 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400&h=400&fit=crop', '#A8A29E', 10, false)
ON CONFLICT (name) DO NOTHING;

-- Insert default panels
INSERT INTO panels (name, category, rate_per_sqft, description) VALUES
  ('Fluted Panel', 'fluted', 450.00, 'Vertical grooved panel design'),
  ('Groove Panel', 'groove', 420.00, 'Horizontal groove pattern'),
  ('Texture Panel', 'texture', 480.00, '3D textured surface'),
  ('Plain Panel', 'plain', 350.00, 'Smooth plain finish'),
  ('Waffle Panel', 'texture', 520.00, 'Waffle pattern texture'),
  ('Slat Panel', 'slat', 550.00, 'Wooden slat design')
ON CONFLICT (name) DO NOTHING;

-- Insert default tags
INSERT INTO tags (name, category, color_code) VALUES
  ('Modern', 'style', '#3B82F6'),
  ('Classic', 'style', '#8B5CF6'),
  ('Minimalist', 'style', '#6B7280'),
  ('Luxury', 'style', '#F59E0B'),
  ('Warm', 'mood', '#EF4444'),
  ('Cool', 'mood', '#06B6D4'),
  ('Neutral', 'mood', '#9CA3AF'),
  ('Wood', 'material', '#92400E'),
  ('Marble', 'material', '#F5E6D3'),
  ('Metal', 'material', '#71717A')
ON CONFLICT (name) DO NOTHING;

-- Insert default addons
INSERT INTO addons (name, category, size, color_options, base_price, unit) VALUES
  ('Modular TV Unit', 'furniture', 'large', ARRAY['white', 'black', 'wood'], 25000.00, 'piece'),
  ('Wall Shelf', 'furniture', 'medium', ARRAY['white', 'black', 'wood'], 5000.00, 'piece'),
  ('LED Strip Light', 'lighting', 'small', ARRAY['warm-white', 'cool-white', 'rgb'], 1500.00, 'piece'),
  ('Spotlight', 'lighting', 'small', ARRAY['white', 'black'], 800.00, 'piece'),
  ('Handle Set', 'hardware', 'small', ARRAY['chrome', 'gold', 'black'], 500.00, 'set')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check materials
SELECT 'Materials' as table_name, COUNT(*) as count FROM materials WHERE is_active = true;

-- Check panels
SELECT 'Panels' as table_name, COUNT(*) as count FROM panels WHERE is_active = true;

-- Check tags
SELECT 'Tags' as table_name, COUNT(*) as count FROM tags WHERE is_active = true;

-- Check addons
SELECT 'Addons' as table_name, COUNT(*) as count FROM addons WHERE is_active = true;

-- List all tables
SELECT 
  'All Tables Created' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('materials', 'panels', 'addons', 'tags', 'products', 'design_panels', 'quotations', 'slider_groups', 'admin_settings', 'activity_log');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Database schema created successfully!' as message;
SELECT '✅ 10 materials added' as message;
SELECT '✅ 6 panels added' as message;
SELECT '✅ 10 tags added' as message;
SELECT '✅ 5 addons added' as message;
SELECT '✅ Ready to build the app!' as message;
