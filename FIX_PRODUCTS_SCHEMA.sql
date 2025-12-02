-- ============================================
-- FIX PRODUCTS TABLE SCHEMA
-- ============================================
-- This updates the existing products table to match the new schema
-- and migrates existing data

-- Step 1: Add missing columns if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS space_category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material_slugs TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS tag_slugs TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS panel_ids UUID[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_2 TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_3 TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url_4 TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(10,2);

-- Step 2: Generate slugs for existing products
UPDATE products 
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Step 3: Map room_type to space_category
UPDATE products 
SET space_category = CASE 
  WHEN lower(room_type) LIKE '%tv%' OR lower(room_type) LIKE '%unit%' THEN 'tv-unit'
  WHEN lower(room_type) LIKE '%living%' THEN 'living-room'
  WHEN lower(room_type) LIKE '%bedroom%' THEN 'bedroom'
  WHEN lower(room_type) LIKE '%entrance%' THEN 'entrance'
  WHEN lower(room_type) LIKE '%study%' THEN 'study'
  WHEN lower(room_type) LIKE '%mandir%' OR lower(room_type) LIKE '%pooja%' THEN 'mandir'
  ELSE 'living-room' -- default
END
WHERE space_category IS NULL;

-- Step 4: Map finish_type to material_slugs
UPDATE products 
SET material_slugs = ARRAY[
  CASE 
    WHEN lower(finish_type) LIKE '%marble%' THEN 'marble'
    WHEN lower(finish_type) LIKE '%wood%' THEN 'wooden'
    WHEN lower(finish_type) LIKE '%fabric%' THEN 'fabric'
    WHEN lower(finish_type) LIKE '%metal%' THEN 'metal'
    WHEN lower(finish_type) LIKE '%glass%' THEN 'glass'
    WHEN lower(finish_type) LIKE '%stone%' THEN 'stone'
    ELSE 'marble' -- default
  END
]
WHERE material_slugs IS NULL OR material_slugs = '{}';

-- Step 5: Generate tags based on color_tone and finish_type
UPDATE products 
SET tag_slugs = ARRAY[
  CASE 
    WHEN lower(color_tone) LIKE '%light%' OR lower(color_tone) LIKE '%white%' THEN 'minimal'
    WHEN lower(color_tone) LIKE '%dark%' THEN 'statement'
    WHEN lower(color_tone) LIKE '%grey%' OR lower(color_tone) LIKE '%gray%' THEN 'modern'
    WHEN lower(color_tone) LIKE '%beige%' OR lower(color_tone) LIKE '%warm%' THEN 'warm'
    ELSE 'modern'
  END,
  CASE 
    WHEN lower(finish_type) LIKE '%luxe%' OR lower(finish_type) LIKE '%elite%' THEN 'luxury'
    WHEN lower(finish_type) LIKE '%classic%' THEN 'classic'
    ELSE 'modern'
  END
]
WHERE tag_slugs IS NULL OR tag_slugs = '{}';

-- Step 6: Set thumbnail_url same as image_url if not set
UPDATE products 
SET thumbnail_url = image_url
WHERE thumbnail_url IS NULL AND image_url IS NOT NULL;

-- Step 7: Mark some products as featured (top 3 by price)
UPDATE products 
SET is_featured = true
WHERE id IN (
  SELECT id FROM products 
  ORDER BY price_per_sqft DESC 
  LIMIT 3
);

-- Step 8: Create unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Step 9: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_products_space_category ON products(space_category);
CREATE INDEX IF NOT EXISTS idx_products_material_slugs ON products USING GIN(material_slugs);
CREATE INDEX IF NOT EXISTS idx_products_tag_slugs ON products USING GIN(tag_slugs);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

-- Step 10: Verify the migration
SELECT 
  'Products Updated' as status,
  COUNT(*) as total_products,
  COUNT(CASE WHEN slug IS NOT NULL THEN 1 END) as with_slug,
  COUNT(CASE WHEN space_category IS NOT NULL THEN 1 END) as with_space,
  COUNT(CASE WHEN material_slugs IS NOT NULL AND material_slugs != '{}' THEN 1 END) as with_materials,
  COUNT(CASE WHEN tag_slugs IS NOT NULL AND tag_slugs != '{}' THEN 1 END) as with_tags,
  COUNT(CASE WHEN is_featured = true THEN 1 END) as featured
FROM products;

-- Step 11: Show sample of updated products
SELECT 
  name,
  slug,
  space_category,
  material_slugs,
  tag_slugs,
  is_featured,
  price_per_sqft
FROM products
LIMIT 5;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Products table schema fixed!' as message;
SELECT '✅ Existing products migrated to new schema!' as message;
SELECT '✅ Slugs, categories, materials, and tags added!' as message;
