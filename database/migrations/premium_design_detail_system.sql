-- =====================================================
-- PREMIUM DESIGN DETAIL SYSTEM - DATABASE SCHEMA
-- =====================================================
-- Complete database structure for premium design detail page
-- with full admin control and dynamic content
-- =====================================================

-- =====================================================
-- Step 1: Update products table for design details
-- =====================================================

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS full_description TEXT,
ADD COLUMN IF NOT EXISTS fixed_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_calculation_type VARCHAR(20) DEFAULT 'per_sqft',
ADD COLUMN IF NOT EXISTS image_url_3 TEXT,
ADD COLUMN IF NOT EXISTS image_url_4 TEXT,
ADD COLUMN IF NOT EXISTS image_url_5 TEXT,
ADD COLUMN IF NOT EXISTS images_order JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Create slug from name if not exists
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- =====================================================
-- Step 2: Create add-ons table
-- =====================================================

CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  pricing_type VARCHAR(20) DEFAULT 'fixed', -- fixed or per_sqft
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Step 3: Create design_addons junction table
-- =====================================================

CREATE TABLE IF NOT EXISTS design_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES addons(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  custom_price DECIMAL(10,2), -- Override default addon price
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(design_id, addon_id)
);

-- =====================================================
-- Step 4: Create products_catalog table (for accessories)
-- =====================================================

CREATE TABLE IF NOT EXISTS products_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  image_url TEXT,
  price DECIMAL(10,2),
  brand VARCHAR(100),
  specifications JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Step 5: Create design_products junction table
-- =====================================================

CREATE TABLE IF NOT EXISTS design_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products_catalog(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(design_id, product_id)
);

-- =====================================================
-- Step 6: Create filter_categories table
-- =====================================================

CREATE TABLE IF NOT EXISTS filter_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Step 7: Update filters table with category reference
-- =====================================================

ALTER TABLE filters 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES filter_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS color VARCHAR(7),
ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

-- =====================================================
-- Step 8: Create design_filters junction table
-- =====================================================

CREATE TABLE IF NOT EXISTS design_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  filter_id UUID NOT NULL REFERENCES filters(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(design_id, filter_id)
);

-- =====================================================
-- Step 9: Insert default data
-- =====================================================

-- Default Add-ons
INSERT INTO addons (name, description, price, pricing_type, icon, display_order) VALUES
('Premium Finish', 'High-quality premium finish coating', 150.00, 'per_sqft', '✨', 1),
('LED Lighting', 'Integrated LED lighting system', 5000.00, 'fixed', '💡', 2),
('Custom Color', 'Custom color matching service', 100.00, 'per_sqft', '🎨', 3),
('Installation', 'Professional installation service', 200.00, 'per_sqft', '🔧', 4),
('Warranty Extension', '5-year extended warranty', 3000.00, 'fixed', '🛡️', 5)
ON CONFLICT DO NOTHING;

-- Default Filter Categories
INSERT INTO filter_categories (name, slug, display_order) VALUES
('Budget', 'budget', 1),
('Lighting', 'lighting', 2),
('Style', 'style', 3),
('Finish', 'finish', 4)
ON CONFLICT (slug) DO NOTHING;

-- Update existing filters with categories
UPDATE filters SET category_id = (SELECT id FROM filter_categories WHERE slug = 'budget')
WHERE category = 'budget';

UPDATE filters SET category_id = (SELECT id FROM filter_categories WHERE slug = 'lighting')
WHERE category = 'lighting';

-- Default Product Categories
INSERT INTO products_catalog (name, description, category, image_url, price, brand, display_order) VALUES
('LED Strip Light - Warm White', 'High-quality LED strip lighting', 'Lighting', 'https://via.placeholder.com/300', 1500.00, 'Philips', 1),
('Wall Panel Adhesive', 'Professional grade adhesive', 'Installation', 'https://via.placeholder.com/300', 500.00, 'Fevicol', 2),
('Decorative Molding', 'Premium decorative molding', 'Accessories', 'https://via.placeholder.com/300', 800.00, 'Asian Paints', 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Step 10: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_price_calc ON products(price_calculation_type);

CREATE INDEX IF NOT EXISTS idx_addons_active ON addons(is_active);
CREATE INDEX IF NOT EXISTS idx_addons_order ON addons(display_order);

CREATE INDEX IF NOT EXISTS idx_design_addons_design ON design_addons(design_id);
CREATE INDEX IF NOT EXISTS idx_design_addons_addon ON design_addons(addon_id);

CREATE INDEX IF NOT EXISTS idx_products_catalog_category ON products_catalog(category);
CREATE INDEX IF NOT EXISTS idx_products_catalog_active ON products_catalog(is_active);

CREATE INDEX IF NOT EXISTS idx_design_products_design ON design_products(design_id);
CREATE INDEX IF NOT EXISTS idx_design_products_product ON design_products(product_id);

CREATE INDEX IF NOT EXISTS idx_filter_categories_slug ON filter_categories(slug);
CREATE INDEX IF NOT EXISTS idx_filter_categories_active ON filter_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_filters_category ON filters(category_id);

CREATE INDEX IF NOT EXISTS idx_design_filters_design ON design_filters(design_id);
CREATE INDEX IF NOT EXISTS idx_design_filters_filter ON design_filters(filter_id);

-- =====================================================
-- Step 11: Create updated_at triggers
-- =====================================================

DROP TRIGGER IF EXISTS update_addons_updated_at ON addons;
CREATE TRIGGER update_addons_updated_at BEFORE UPDATE ON addons
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_catalog_updated_at ON products_catalog;
CREATE TRIGGER update_products_catalog_updated_at BEFORE UPDATE ON products_catalog
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_filter_categories_updated_at ON filter_categories;
CREATE TRIGGER update_filter_categories_updated_at BEFORE UPDATE ON filter_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Step 12: Enable Row Level Security
-- =====================================================

ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_filters ENABLE ROW LEVEL SECURITY;

-- Public read access for active items
CREATE POLICY "Public can view active addons" ON addons
FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view design addons" ON design_addons
FOR SELECT USING (is_enabled = true);

CREATE POLICY "Public can view active products" ON products_catalog
FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view design products" ON design_products
FOR SELECT USING (true);

CREATE POLICY "Public can view active filter categories" ON filter_categories
FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view design filters" ON design_filters
FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admins have full access to addons" ON addons
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins have full access to design_addons" ON design_addons
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins have full access to products_catalog" ON products_catalog
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins have full access to design_products" ON design_products
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins have full access to filter_categories" ON filter_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins have full access to design_filters" ON design_filters
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- =====================================================
-- Step 13: Create helper views
-- =====================================================

-- View for complete design details
CREATE OR REPLACE VIEW design_details_view AS
SELECT 
  p.*,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', a.id,
        'name', a.name,
        'description', a.description,
        'price', COALESCE(da.custom_price, a.price),
        'pricing_type', a.pricing_type,
        'icon', a.icon,
        'display_order', da.display_order
      )
    ) FILTER (WHERE a.id IS NOT NULL),
    '[]'
  ) as addons,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', pc.id,
        'name', pc.name,
        'description', pc.description,
        'category', pc.category,
        'image_url', pc.image_url,
        'price', pc.price,
        'brand', pc.brand,
        'quantity', dp.quantity,
        'display_order', dp.display_order
      )
    ) FILTER (WHERE pc.id IS NOT NULL),
    '[]'
  ) as products,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', f.id,
        'name', f.name,
        'slug', f.slug,
        'category', fc.name,
        'color', f.color,
        'icon', f.icon
      )
    ) FILTER (WHERE f.id IS NOT NULL),
    '[]'
  ) as filters
FROM products p
LEFT JOIN design_addons da ON p.id = da.design_id AND da.is_enabled = true
LEFT JOIN addons a ON da.addon_id = a.id AND a.is_active = true
LEFT JOIN design_products dp ON p.id = dp.design_id
LEFT JOIN products_catalog pc ON dp.product_id = pc.id AND pc.is_active = true
LEFT JOIN design_filters df ON p.id = df.design_id
LEFT JOIN filters f ON df.filter_id = f.id AND f.is_active = true
LEFT JOIN filter_categories fc ON f.category_id = fc.id
WHERE p.is_active = true
GROUP BY p.id;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
-- ✅ Updated products table with detail fields
-- ✅ Created addons system
-- ✅ Created products catalog
-- ✅ Created filter categories
-- ✅ Created all junction tables
-- ✅ Added indexes for performance
-- ✅ Added RLS policies
-- ✅ Created helper views
-- ✅ Inserted default data
-- =====================================================
