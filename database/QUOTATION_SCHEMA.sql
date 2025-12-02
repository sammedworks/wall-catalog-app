-- ============================================
-- QUOTATION BUILDER SYSTEM - DATABASE SCHEMA
-- ============================================
-- Complete schema for dynamic quotation system
-- All prices and rates controlled by Admin Panel

-- ============================================
-- 1. PANEL MATERIALS (Stage 1)
-- ============================================

CREATE TABLE IF NOT EXISTS panel_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  material_type TEXT NOT NULL, -- Wood, Marble, Stone, Paint, etc.
  color_code TEXT, -- Hex color for UI display
  rate_per_sqft DECIMAL(10,2) NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE panel_materials ENABLE ROW LEVEL SECURITY;

-- Public can view active materials
CREATE POLICY "Anyone can view active panel materials"
  ON panel_materials FOR SELECT
  USING (is_active = true);

-- Admins can manage
CREATE POLICY "Admins can manage panel materials"
  ON panel_materials FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- Sample data
INSERT INTO panel_materials (name, material_type, color_code, rate_per_sqft, display_order) VALUES
('Walnut Wood', 'Wood', '#5D4037', 500, 1),
('Oak Wood', 'Wood', '#8D6E63', 450, 2),
('Teak Wood', 'Wood', '#6D4C41', 550, 3),
('Italian Marble', 'Marble', '#ECEFF1', 600, 4),
('Natural Stone', 'Stone', '#78909C', 480, 5),
('Premium Paint', 'Paint', '#90CAF9', 200, 6);

-- ============================================
-- 2. MODULAR FURNITURE (Stage 2)
-- ============================================

CREATE TABLE IF NOT EXISTS modular_furniture (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT, -- Console, Cabinet, Shelf, etc.
  size TEXT NOT NULL, -- "4 ft", "5 ft", "6 ft"
  price DECIMAL(10,2) NOT NULL,
  colors TEXT[], -- Array of color names
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE modular_furniture ENABLE ROW LEVEL SECURITY;

-- Public can view active furniture
CREATE POLICY "Anyone can view active furniture"
  ON modular_furniture FOR SELECT
  USING (is_active = true);

-- Admins can manage
CREATE POLICY "Admins can manage furniture"
  ON modular_furniture FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- Sample data
INSERT INTO modular_furniture (name, category, size, price, colors, display_order) VALUES
('Grooveline Console', 'Console', '4 ft', 7999, ARRAY['White', 'Beige', 'Walnut', 'Grey', 'Black', 'Teak'], 1),
('Grooveline Console', 'Console', '5 ft', 9999, ARRAY['White', 'Beige', 'Walnut', 'Grey', 'Black', 'Teak'], 2),
('Grooveline Console', 'Console', '6 ft', 11999, ARRAY['White', 'Beige', 'Walnut', 'Grey', 'Black', 'Teak'], 3),
('Modern Cabinet', 'Cabinet', '4 ft', 12999, ARRAY['White', 'Black', 'Walnut'], 4),
('Floating Shelf', 'Shelf', '3 ft', 3999, ARRAY['White', 'Black', 'Walnut', 'Oak'], 5);

-- ============================================
-- 3. LIGHTING OPTIONS (Stage 3)
-- ============================================

CREATE TABLE IF NOT EXISTS lighting_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- Profile Light, Cove Light, Wall Light
  price DECIMAL(10,2) NOT NULL,
  unit TEXT DEFAULT 'piece', -- piece, meter, set
  description TEXT,
  specifications JSONB,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lighting_options ENABLE ROW LEVEL SECURITY;

-- Public can view active lighting
CREATE POLICY "Anyone can view active lighting"
  ON lighting_options FOR SELECT
  USING (is_active = true);

-- Admins can manage
CREATE POLICY "Admins can manage lighting"
  ON lighting_options FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- Sample data
INSERT INTO lighting_options (name, category, price, display_order) VALUES
-- Profile Light
('240 LED Installation Kit', 'Profile Light', 2500, 1),
('Aluminium Channel', 'Profile Light', 500, 2),
('Profile Light Casing', 'Profile Light', 400, 3),
-- Cove Light
('Cove LED Strip (5m)', 'Cove Light', 3500, 4),
('Cove Light Diffuser', 'Cove Light', 800, 5),
('Cove Light Controller', 'Cove Light', 1200, 6),
-- Wall Light
('Wall Mounted LED', 'Wall Light', 1500, 7),
('Designer Wall Sconce', 'Wall Light', 2800, 8),
('Smart Wall Light', 'Wall Light', 4500, 9);

-- ============================================
-- 4. INSTALLATION ACCESSORIES (Stage 4)
-- ============================================

CREATE TABLE IF NOT EXISTS installation_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL, -- fixed, per_sqft, per_meter
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE installation_accessories ENABLE ROW LEVEL SECURITY;

-- Public can view active accessories
CREATE POLICY "Anyone can view active accessories"
  ON installation_accessories FOR SELECT
  USING (is_active = true);

-- Admins can manage
CREATE POLICY "Admins can manage accessories"
  ON installation_accessories FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- Sample data
INSERT INTO installation_accessories (name, price, unit, display_order) VALUES
('PVC Board (12mm)', 1500, 'fixed', 1),
('Metal Trims', 600, 'per_sqft', 2),
('Woven Edge Bidding', 400, 'per_sqft', 3),
('Corner Brackets', 800, 'fixed', 4),
('Wall Anchors Set', 500, 'fixed', 5);

-- ============================================
-- 5. PRICING CONFIGURATION (Stage 5)
-- ============================================

CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Enable RLS
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Public can view config
CREATE POLICY "Anyone can view pricing config"
  ON pricing_config FOR SELECT
  USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage pricing config"
  ON pricing_config FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- Sample data
INSERT INTO pricing_config (config_key, config_value, description) VALUES
('labour_charges', '{"base": 1500, "complex_multiplier": 1.2, "weekend_multiplier": 1.15}'::jsonb, 'Labour charges configuration'),
('transportation', '{"base": 500, "per_km": 10, "free_above": 50000}'::jsonb, 'Transportation charges'),
('gst', '{"percentage": 18, "applicable": true}'::jsonb, 'GST configuration'),
('discounts', '{"bulk": {"threshold": 50000, "percentage": 5}, "festival": {"active": false, "percentage": 15}}'::jsonb, 'Discount rules');

-- ============================================
-- 6. QUOTATIONS (Main Table)
-- ============================================

CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES user_profiles(id),
  
  -- Area Selection
  selected_area TEXT NOT NULL, -- tv-unit, living-room, bedroom, entrance, study, mandir
  
  -- Stage 1: Panel Selection (array of panels)
  panels JSONB[] DEFAULT '{}', -- [{panel_id, panel_name, rate_per_sqft, wall_area, subtotal}]
  
  -- Stage 2: Modular Furniture (array)
  furniture JSONB[] DEFAULT '{}', -- [{furniture_id, name, size, color, price, quantity}]
  
  -- Stage 3: Lighting (array)
  lighting JSONB[] DEFAULT '{}', -- [{lighting_id, name, category, price, quantity}]
  
  -- Stage 4: Accessories (array)
  accessories JSONB[] DEFAULT '{}', -- [{accessory_id, name, price, unit, quantity, area, subtotal}]
  
  -- Stage 5: Final Costing
  panel_cost DECIMAL(10,2) DEFAULT 0,
  furniture_cost DECIMAL(10,2) DEFAULT 0,
  lighting_cost DECIMAL(10,2) DEFAULT 0,
  accessories_cost DECIMAL(10,2) DEFAULT 0,
  labour_charges DECIMAL(10,2) DEFAULT 0,
  transportation DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,
  gst_percentage DECIMAL(5,2) DEFAULT 18,
  gst_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft, sent, approved, rejected
  valid_until DATE,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Users can view their own quotations
CREATE POLICY "Users can view own quotations"
  ON quotations FOR SELECT
  USING (customer_id = auth.uid() OR auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- Users can create quotations
CREATE POLICY "Users can create quotations"
  ON quotations FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Users can update their own quotations
CREATE POLICY "Users can update own quotations"
  ON quotations FOR UPDATE
  USING (customer_id = auth.uid() OR auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- Admins can delete
CREATE POLICY "Admins can delete quotations"
  ON quotations FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'admin'
  ));

-- ============================================
-- 7. SAVED DESIGNS
-- ============================================

CREATE TABLE IF NOT EXISTS saved_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) NOT NULL,
  design_name TEXT,
  quotation_data JSONB NOT NULL, -- Complete quotation snapshot
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;

-- Users can manage their own saved designs
CREATE POLICY "Users can manage own saved designs"
  ON saved_designs FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Function to generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  month TEXT;
  count INTEGER;
  quote_num TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  month := TO_CHAR(NOW(), 'MM');
  
  SELECT COUNT(*) + 1 INTO count
  FROM quotations
  WHERE quote_number LIKE 'QT-' || year || '-' || month || '-%';
  
  quote_num := 'QT-' || year || '-' || month || '-' || LPAD(count::TEXT, 4, '0');
  
  RETURN quote_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update quotation timestamp
CREATE OR REPLACE FUNCTION update_quotation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quotations
DROP TRIGGER IF EXISTS update_quotation_timestamp ON quotations;
CREATE TRIGGER update_quotation_timestamp
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_quotation_timestamp();

-- ============================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created ON quotations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_panel_materials_active ON panel_materials(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_furniture_active ON modular_furniture(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_lighting_active ON lighting_options(is_active, category, display_order);
CREATE INDEX IF NOT EXISTS idx_accessories_active ON installation_accessories(is_active, display_order);

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- All tables created with RLS policies
-- Ready for Admin Panel and Quotation Builder
