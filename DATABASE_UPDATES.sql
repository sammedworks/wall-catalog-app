-- =====================================================
-- WALL CATALOG APP - DATABASE SCHEMA
-- Complete schema for 6 areas, materials, tags, and products
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MATERIALS TABLE (Enhanced for "Explore by Look")
-- =====================================================
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier (e.g., 'marble-luxe')
  description TEXT,
  
  -- Visual
  thumbnail_url TEXT, -- Main thumbnail image for slider
  color_code TEXT DEFAULT '#F5F5F5', -- Fallback color if no image
  text_color TEXT DEFAULT '#374151', -- Text color for overlay
  
  -- Categorization
  category TEXT DEFAULT 'material', -- 'material', 'finish', 'style'
  tags TEXT[], -- Additional tags for filtering
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  filter_usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. DESIGN TAGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS design_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Categorization
  category TEXT DEFAULT 'style', -- 'style', 'material', 'price', 'feature', 'room', 'other'
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. PRODUCTS TABLE (Enhanced)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- Categorization
  space_category TEXT, -- 'tv-unit', 'living-room', 'bedroom', 'entrance', 'study', 'mandir'
  finish_type TEXT,
  
  -- Materials & Tags
  material_ids UUID[], -- Array of material IDs for filtering
  material_names TEXT[], -- Denormalized for quick filtering
  tag_ids UUID[], -- Array of tag IDs
  tags JSONB, -- Flexible tag storage
  
  -- Pricing
  price_per_sqft NUMERIC NOT NULL,
  min_order_area NUMERIC DEFAULT 0,
  
  -- Images
  image_url TEXT,
  image_url_2 TEXT,
  images TEXT[],
  
  -- Display
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add constraint for space_category
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_space_category_check;

ALTER TABLE products 
ADD CONSTRAINT products_space_category_check 
CHECK (space_category IN ('tv-unit', 'living-room', 'bedroom', 'entrance', 'study', 'mandir'));

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Materials
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active);
CREATE INDEX IF NOT EXISTS idx_materials_featured ON materials(is_featured);
CREATE INDEX IF NOT EXISTS idx_materials_display_order ON materials(display_order);
CREATE INDEX IF NOT EXISTS idx_materials_slug ON materials(slug);

-- Design Tags
CREATE INDEX IF NOT EXISTS idx_design_tags_active ON design_tags(is_active);
CREATE INDEX IF NOT EXISTS idx_design_tags_category ON design_tags(category);
CREATE INDEX IF NOT EXISTS idx_design_tags_slug ON design_tags(slug);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_space_category ON products(space_category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_material_ids ON products USING GIN(material_ids);
CREATE INDEX IF NOT EXISTS idx_products_material_names ON products USING GIN(material_names);
CREATE INDEX IF NOT EXISTS idx_products_tag_ids ON products USING GIN(tag_ids);

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Auto-generate slug from name for materials
CREATE OR REPLACE FUNCTION generate_material_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_material_slug ON materials;
CREATE TRIGGER set_material_slug
  BEFORE INSERT OR UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION generate_material_slug();

-- Auto-generate slug from name for tags
CREATE OR REPLACE FUNCTION generate_tag_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_tag_slug ON design_tags;
CREATE TRIGGER set_tag_slug
  BEFORE INSERT OR UPDATE ON design_tags
  FOR EACH ROW
  EXECUTE FUNCTION generate_tag_slug();

-- Auto-generate slug from name for products
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_product_slug ON products;
CREATE TRIGGER set_product_slug
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION generate_product_slug();

-- Update timestamp on materials
CREATE OR REPLACE FUNCTION update_materials_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_materials_timestamp ON materials;
CREATE TRIGGER update_materials_timestamp
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_materials_timestamp();

-- Update timestamp on design_tags
CREATE OR REPLACE FUNCTION update_tags_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tags_timestamp ON design_tags;
CREATE TRIGGER update_tags_timestamp
  BEFORE UPDATE ON design_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tags_timestamp();

-- Update timestamp on products
CREATE OR REPLACE FUNCTION update_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_timestamp ON products;
CREATE TRIGGER update_products_timestamp
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_timestamp();

-- =====================================================
-- 6. DEFAULT DATA - MATERIALS (Explore by Look)
-- =====================================================

-- Clear existing materials
TRUNCATE TABLE materials CASCADE;

-- Insert default materials with thumbnails
INSERT INTO materials (name, slug, description, thumbnail_url, color_code, display_order, is_active, is_featured) VALUES
('Marble', 'marble', 'Elegant marble finish with natural veining', 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&h=400&fit=crop', '#F5E6D3', 1, true, true),
('Marble Luxe', 'marble-luxe', 'Premium marble with gold accents', 'https://images.unsplash.com/photo-1618219944342-824e40a13285?w=400&h=400&fit=crop', '#E8DCC8', 2, true, true),
('Wooden', 'wooden', 'Natural wood grain texture', 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400&h=400&fit=crop', '#8B6F47', 3, true, true),
('Fabric', 'fabric', 'Soft fabric texture panels', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', '#D4C5B9', 4, true, false),
('Waffle', 'waffle', 'Textured waffle pattern', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=400&fit=crop', '#C8B8A8', 5, true, false),
('Grey', 'grey', 'Modern grey concrete finish', 'https://images.unsplash.com/photo-1615875474908-f403116f5287?w=400&h=400&fit=crop', '#9CA3AF', 6, true, false),
('White', 'white', 'Clean white minimalist', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop', '#F9FAFB', 7, true, false),
('Glass', 'glass', 'Sleek glass panels', 'https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?w=400&h=400&fit=crop', '#E0F2FE', 8, true, false),
('Metal', 'metal', 'Industrial metal finish', 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400&h=400&fit=crop', '#94A3B8', 9, true, false),
('Stone', 'stone', 'Natural stone texture', 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&h=400&fit=crop', '#78716C', 10, true, false);

-- =====================================================
-- 7. DEFAULT DATA - DESIGN TAGS
-- =====================================================

-- Clear existing tags
TRUNCATE TABLE design_tags CASCADE;

-- Insert default tags
INSERT INTO design_tags (name, slug, category, display_order, is_active) VALUES
-- Style tags
('Modern', 'modern', 'style', 1, true),
('Classic', 'classic', 'style', 2, true),
('Minimalist', 'minimalist', 'style', 3, true),
('Luxury', 'luxury', 'style', 4, true),
('Contemporary', 'contemporary', 'style', 5, true),
('Traditional', 'traditional', 'style', 6, true),

-- Feature tags
('LED Lighting', 'led-lighting', 'feature', 7, true),
('Storage', 'storage', 'feature', 8, true),
('Floating', 'floating', 'feature', 9, true),
('Wall Mounted', 'wall-mounted', 'feature', 10, true),

-- Price tags
('Budget Friendly', 'budget-friendly', 'price', 11, true),
('Premium', 'premium', 'price', 12, true),
('Mid Range', 'mid-range', 'price', 13, true);

-- =====================================================
-- 8. SAMPLE PRODUCTS (Optional - for testing)
-- =====================================================

-- You can insert sample products here or do it via admin panel
-- Example:
-- INSERT INTO products (name, space_category, material_names, price_per_sqft, image_url, is_active) VALUES
-- ('Marble Luxe Retreat', 'bedroom', ARRAY['Marble', 'Marble Luxe'], 320, 'https://example.com/image.jpg', true);

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Function to get active materials for slider
CREATE OR REPLACE FUNCTION get_active_materials()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  thumbnail_url TEXT,
  color_code TEXT,
  display_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.slug,
    m.thumbnail_url,
    m.color_code,
    m.display_order
  FROM materials m
  WHERE m.is_active = true
  ORDER BY m.display_order, m.name;
END;
$$ LANGUAGE plpgsql;

-- Function to filter products by materials
CREATE OR REPLACE FUNCTION filter_products_by_materials(material_slugs TEXT[])
RETURNS TABLE (
  id UUID,
  name TEXT,
  space_category TEXT,
  price_per_sqft NUMERIC,
  image_url TEXT,
  material_names TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.space_category,
    p.price_per_sqft,
    p.image_url,
    p.material_names
  FROM products p
  WHERE 
    p.is_active = true
    AND (
      material_slugs IS NULL 
      OR material_slugs = ARRAY[]::TEXT[]
      OR p.material_names && material_slugs
    )
  ORDER BY p.display_order, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables
SELECT 'Materials table ready' as status, COUNT(*) as count FROM materials;
SELECT 'Design tags table ready' as status, COUNT(*) as count FROM design_tags;
SELECT 'Products table ready' as status, COUNT(*) as count FROM products;