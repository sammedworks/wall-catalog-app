# 🎨 Designs Library System Documentation

## Overview

**Single unified system** for managing all wall designs. No more confusion between "Designs" and "Design Library" - everything is now in one place called **Designs Library**.

---

## ✅ **What Changed:**

### **REMOVED:**
- ❌ Tags module (completely deleted)
- ❌ Old Designs module (completely deleted)
- ❌ `tags` database table
- ❌ `design_tags` junction table
- ❌ `designs` old table
- ❌ Tag-based filtering
- ❌ Confusing dual systems

### **KEPT (Consolidated):**
- ✅ **Designs Library** (main system)
- ✅ Materials
- ✅ Looks
- ✅ Spaces
- ✅ Filters
- ✅ Slider Manager

---

## 🎯 **New Structure:**

### **Single Source of Truth:**
```
Designs Library (products table)
├── Design Name
├── Space Category (TV Unit, Living Room, etc.)
├── Look / Material (Wood, Marble, etc.)
├── Style Category (Economy, Minimal, Luxe, Statement)
├── Lighting Type (Cove Light, Profile Light, etc.)
├── Images (image_url, image_url_2)
├── Price per sq.ft
├── Description
└── Active / Inactive toggle
```

---

## 📊 **Database Schema:**

### **Main Table: `products`**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  image_url_2 TEXT,
  space_category VARCHAR(50),      -- tv-unit, living-room, bedroom, etc.
  material_type VARCHAR(50),        -- Wood, Marble, Rattan, etc.
  style_category VARCHAR(50),       -- Economy, Minimal, Luxe, Statement
  lighting_type VARCHAR(100),       -- Cove Light, Profile Light, etc.
  price_per_sqft DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Supporting Tables:**

**1. Spaces**
```sql
CREATE TABLE spaces (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**2. Looks**
```sql
CREATE TABLE looks (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7),              -- Hex color code
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**3. Materials**
```sql
CREATE TABLE materials (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**4. Filters**
```sql
CREATE TABLE filters (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50),          -- budget, lighting, etc.
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**5. Slider Items**
```sql
CREATE TABLE slider_items (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🎨 **Admin Panel Structure:**

### **Sidebar Menu:**
```
📊 Dashboard
📦 Designs Library    ← Main module
🎨 Materials
👁️ Looks
🏠 Spaces
🔍 Filters
🎚️ Slider Manager
📧 Enquiries
📄 Quotations
⚙️ Settings
```

### **Removed from Sidebar:**
- ❌ Tags
- ❌ Old Designs
- ❌ Customers (if not needed)
- ❌ Analytics (if not needed)

---

## 📋 **Design Fields:**

### **Required Fields:**
1. **Design Name** - Unique identifier
2. **Image** - Primary image URL
3. **Active Status** - Show/hide on site

### **Optional Fields:**
4. **Description** - Design details
5. **Secondary Image** - Additional view
6. **Space Category** - Where it's used
7. **Look / Material** - Visual style
8. **Style Category** - Budget level
9. **Lighting Type** - Lighting option
10. **Price per sq.ft** - Pricing

---

## 🎯 **Space Categories:**

### **6 Default Spaces:**
1. **TV Unit** (`tv-unit`) - 📺
2. **Living Room** (`living-room`) - 🛋️
3. **Bedroom** (`bedroom`) - 🛏️
4. **Entrance** (`entrance`) - 🚪
5. **Study** (`study`) - 📚
6. **Mandir** (`mandir`) - 🕉️

### **Usage:**
- Filter designs by space
- Homepage space cards
- Space-specific pages
- Design categorization

---

## 👁️ **Look / Material Categories:**

### **9 Default Looks:**
1. **Wood** (#8B4513)
2. **Marble** (#F5F5F5)
3. **Rattan** (#D2B48C)
4. **Fabric** (#E6E6FA)
5. **Limewash** (#F0EAD6)
6. **Pastel** (#FFB6C1)
7. **Stone** (#808080)
8. **Gold** (#FFD700)
9. **Traditional** (#8B0000)

### **Usage:**
- Filter designs by look
- Homepage slider
- Look-specific filtering
- Visual categorization

---

## 🔍 **Filter Categories:**

### **Budget Filters:**
1. **Economy** - Budget-friendly
2. **Minimal** - Simple, clean
3. **Luxe** - Premium quality
4. **Statement** - Bold, unique

### **Lighting Filters:**
1. **Cove Light** - Indirect lighting
2. **Profile Light** - Linear lighting
3. **Wall Washer Light** - Accent lighting

### **Usage:**
- All Designs page filtering
- Advanced search
- Design discovery
- User preferences

---

## 🎚️ **Slider Manager:**

### **Purpose:**
Manage homepage "Explore by View" slider

### **Features:**
- Add/edit/delete slides
- Upload images
- Set display order
- Enable/disable slides
- Link to filtered pages

### **Integration:**
- Homepage slider
- Look-based filtering
- Visual navigation

---

## 🔄 **Data Flow:**

### **Admin → Database:**
```
1. Admin adds design in Designs Library
   ↓
2. Fills in all fields (name, space, look, etc.)
   ↓
3. Uploads images
   ↓
4. Sets active status
   ↓
5. Saves to products table
```

### **Database → Frontend:**
```
1. User visits /designs
   ↓
2. Loads all active designs from products
   ↓
3. Applies filters (space, look, budget)
   ↓
4. Displays filtered results
   ↓
5. User clicks design → Detail page
```

---

## 🚀 **Migration Steps:**

### **Step 1: Run SQL Migration**
```bash
# In Supabase SQL Editor, run:
database/migrations/cleanup_merge_designs.sql
```

### **Step 2: Verify Tables**
```sql
-- Check products table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products';

-- Check supporting tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('spaces', 'looks', 'materials', 'filters', 'slider_items');
```

### **Step 3: Verify Data**
```sql
-- Check default spaces
SELECT * FROM spaces ORDER BY display_order;

-- Check default looks
SELECT * FROM looks ORDER BY display_order;

-- Check default filters
SELECT * FROM filters ORDER BY category, display_order;
```

### **Step 4: Test Admin Panel**
1. Login to admin panel
2. Check sidebar menu (no Tags, no old Designs)
3. Open Designs Library
4. Verify filters work
5. Test add/edit/delete

### **Step 5: Test Frontend**
1. Visit homepage
2. Check slider works
3. Visit /designs
4. Test filtering
5. Click design → Detail page

---

## 📁 **File Structure:**

### **Admin Pages:**
```
app/admin/
├── products/          ← Designs Library (main)
│   ├── page.js       ← List all designs
│   ├── new/          ← Add new design
│   └── [id]/         ← Edit design
├── materials/         ← Materials manager
├── looks/            ← Looks manager
├── spaces/           ← Spaces manager
├── filters/          ← Filters manager
├── slider/           ← Slider manager
├── enquiries/        ← Enquiries
├── quotations/       ← Quotations
└── settings/         ← Settings
```

### **Frontend Pages:**
```
app/
├── page.js           ← Homepage (slider, spaces)
├── designs/          ← All Designs page
│   └── page.js       ← Grid with filters
├── design/           ← Design detail
│   └── [id]/
│       └── page.js   ← Single design view
└── space/            ← Space pages
    └── [id]/
        └── page.js   ← Space-specific designs
```

### **Components:**
```
components/
├── admin/
│   ├── Sidebar.js    ← Updated menu
│   └── Header.js     ← Admin header
├── ExploreByViewSlider.js  ← Homepage slider
└── SpaceCard.js      ← Space cards
```

---

## 🎨 **Admin Panel Features:**

### **Designs Library Page:**

**Features:**
- ✅ Search by name
- ✅ Filter by space
- ✅ Filter by look
- ✅ View stats (total, active, inactive)
- ✅ Toggle active/inactive
- ✅ Edit design
- ✅ Delete design
- ✅ View on site

**Layout:**
- Header with "Add New Design" button
- Filter bar (search, space, look)
- Stats cards (total, active, inactive, filtered)
- Table with all designs
- Actions (view, edit, delete)

**Table Columns:**
1. Image (thumbnail)
2. Design Name
3. Space
4. Look / Material
5. Price
6. Status (active/inactive toggle)
7. Actions (view, edit, delete)

---

## 🔧 **API Endpoints:**

### **Get All Designs:**
```javascript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false });
```

### **Filter by Space:**
```javascript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .eq('space_category', 'tv-unit');
```

### **Filter by Look:**
```javascript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .eq('material_type', 'Wood');
```

### **Multiple Filters:**
```javascript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .eq('space_category', 'tv-unit')
  .eq('material_type', 'Wood')
  .eq('style_category', 'Luxe');
```

---

## ✅ **Testing Checklist:**

### **Database:**
- [ ] Old tables deleted (tags, design_tags, designs)
- [ ] Products table updated
- [ ] Supporting tables created
- [ ] Default data inserted
- [ ] Indexes created
- [ ] Triggers working
- [ ] RLS policies active

### **Admin Panel:**
- [ ] Sidebar updated (no Tags, no old Designs)
- [ ] Designs Library page loads
- [ ] Search works
- [ ] Filters work
- [ ] Add design works
- [ ] Edit design works
- [ ] Delete design works
- [ ] Toggle active/inactive works

### **Frontend:**
- [ ] Homepage loads
- [ ] Slider works
- [ ] Space cards work
- [ ] /designs page loads
- [ ] Filtering works
- [ ] Design detail page works
- [ ] Images load
- [ ] No broken links

---

## 🐛 **Troubleshooting:**

### **Migration Errors:**
```sql
-- If tables already exist, drop them first:
DROP TABLE IF EXISTS design_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS designs CASCADE;

-- Then run migration again
```

### **Missing Columns:**
```sql
-- Add missing columns manually:
ALTER TABLE products ADD COLUMN IF NOT EXISTS space_category VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS material_type VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS style_category VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS lighting_type VARCHAR(100);
```

### **RLS Issues:**
```sql
-- Disable RLS temporarily for testing:
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing:
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

---

## 📊 **Summary:**

### **Before:**
```
❌ Tags module
❌ Old Designs module
❌ Design Library module
❌ Confusing structure
❌ Duplicate data
❌ Tag-based filtering
```

### **After:**
```
✅ Single Designs Library
✅ Clean structure
✅ Space-based filtering
✅ Look-based filtering
✅ Budget filtering
✅ Lighting filtering
✅ No confusion
✅ Easy to manage
```

---

## 🎯 **Key Benefits:**

1. **Simplicity** - One system, not three
2. **Clarity** - Clear naming and structure
3. **Efficiency** - Faster to manage
4. **Consistency** - Same fields everywhere
5. **Scalability** - Easy to add more designs
6. **Maintainability** - Less code to maintain
7. **User-Friendly** - Easier for admins
8. **Performance** - Optimized queries

---

## 🚀 **Next Steps:**

1. **Run Migration** - Execute SQL file
2. **Test Admin** - Verify all features work
3. **Test Frontend** - Check user experience
4. **Add Designs** - Start populating library
5. **Configure Looks** - Set up slider
6. **Configure Spaces** - Set up space pages
7. **Train Team** - Show admins new system
8. **Monitor** - Watch for issues

**System is now clean, unified, and ready to use!** 🎉
