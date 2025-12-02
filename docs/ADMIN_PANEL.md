# 🎛️ Admin Panel Documentation

## Overview

Complete admin panel for managing the Wall Catalog app with 5 key sections.

---

## 🚀 **Access Admin Panel:**

**URL:** https://wall-catalog-app.vercel.app/admin

---

## 📋 **5 Admin Sections:**

### **1. Spaces Manager** 📐
Manage 6 fixed spaces with slideshow images and descriptions.

### **2. Looks Manager** 🎨
Add/edit material categories for the Explore-by-View slider.

### **3. Designs Library** 🖼️
Upload designs with complete tagging system.

### **4. Slider Manager** 🎚️
Control which looks appear in the homepage slider.

### **5. Filter Manager** 🔍
Enable/disable filters on space and design pages.

---

## 1️⃣ **Spaces Manager**

### **Purpose:**
Manage the 6 fixed spaces that appear on the homepage.

### **Fixed Spaces:**
1. TV Unit Wall
2. Living Room Wall
3. Bedroom Wall
4. Entrance Wall
5. Study Wall
6. Mandir Wall

### **Features:**
- ✅ Edit space descriptions
- ✅ Manage 3 slideshow images per space
- ✅ Preview space pages
- ✅ Cannot add/remove spaces (fixed)

### **How to Use:**

1. **Edit Description:**
   - Click in the description textarea
   - Type new description
   - Click "Save Changes"

2. **Update Slideshow Images:**
   - Paste image URL in the input field
   - Image preview updates automatically
   - Each space has 3 images
   - Click "Save Changes"

3. **Preview Space:**
   - Click "Preview" button
   - Opens space page in new tab
   - See live slideshow

### **URL:**
`/admin/spaces`

---

## 2️⃣ **Looks Manager**

### **Purpose:**
Manage material categories that appear in filters and slider.

### **Default Looks:**
1. Wood (#8B4513)
2. Marble (#F5F5F5)
3. Rattan (#D2B48C)
4. Fabric (#E6E6FA)
5. Limewash (#F0EAD6)
6. Pastel (#FFB6C1)
7. Stone (#808080)
8. Gold (#FFD700)
9. Traditional (#8B0000)

### **Features:**
- ✅ Add new looks
- ✅ Edit look names
- ✅ Change look colors
- ✅ Reorder looks (up/down arrows)
- ✅ Enable/disable looks
- ✅ Delete looks

### **How to Use:**

1. **Add New Look:**
   - Click "Add Look" button
   - Enter name (e.g., "Velvet")
   - Enter ID/slug (e.g., "velvet")
   - Choose color
   - Click "Save Changes"

2. **Edit Look:**
   - Change name in text field
   - Update ID if needed
   - Pick new color with color picker
   - Click "Save Changes"

3. **Reorder Looks:**
   - Click ▲ to move up
   - Click ▼ to move down
   - Order affects slider display
   - Click "Save Changes"

4. **Enable/Disable:**
   - Click eye icon (👁️) to toggle
   - Disabled looks hidden from slider
   - Still available in filters
   - Click "Save Changes"

5. **Delete Look:**
   - Click trash icon (🗑️)
   - Confirm deletion
   - Click "Save Changes"

### **URL:**
`/admin/looks`

---

## 3️⃣ **Designs Library**

### **Purpose:**
Upload and manage all wall designs with complete tagging.

### **Features:**
- ✅ Upload new designs
- ✅ Edit existing designs
- ✅ Search designs
- ✅ Tag with space, look, budget, lighting
- ✅ Set pricing
- ✅ Enable/disable designs
- ✅ Delete designs

### **Design Fields:**

#### **Basic Info:**
- **Name** (required): Design name
- **Description**: Detailed description
- **Primary Image URL** (required): Main image
- **Secondary Image URL**: Additional image

#### **Tags (Required):**
- **Space**: Which space (TV Unit, Living Room, etc.)
- **Look / Material**: Material type (Wood, Marble, etc.)
- **Budget**: Price category (Economy, Minimal, Luxe, Statement)
- **Lighting Type**: Lighting style (Cove Light, Profile Light, Wall Washer Light)

#### **Pricing:**
- **Price per sq.ft** (required): Price in ₹

#### **Status:**
- **Active**: Visible on site (checkbox)

### **How to Use:**

1. **Upload New Design:**
   - Click "Upload Design" button
   - Fill all required fields
   - Add image URLs
   - Select tags (space, look, budget, lighting)
   - Enter price
   - Check "Active" to make visible
   - Click "Upload Design"

2. **Edit Design:**
   - Click edit icon (✏️) on design card
   - Update any fields
   - Click "Update Design"

3. **Search Designs:**
   - Type in search bar
   - Searches name, description, material, space
   - Results filter instantly

4. **Toggle Active/Inactive:**
   - Click eye icon (👁️) on design card
   - Active designs visible on site
   - Inactive designs hidden

5. **Delete Design:**
   - Click trash icon (🗑️)
   - Confirm deletion
   - Design removed permanently

### **URL:**
`/admin/designs`

---

## 4️⃣ **Slider Manager**

### **Purpose:**
Control which looks appear in the "Explore by View" slider on homepage.

### **Features:**
- ✅ Enable/disable looks in slider
- ✅ Reorder slider items
- ✅ Preview slider
- ✅ See enabled count

### **How to Use:**

1. **Enable/Disable Look:**
   - Click eye icon (👁️) to toggle
   - Enabled = Visible in slider
   - Disabled = Hidden from slider
   - Click "Save Changes"

2. **Reorder Slider:**
   - Click ▲ to move up
   - Click ▼ to move down
   - Order affects homepage display
   - Click "Save Changes"

3. **Preview Slider:**
   - See live preview at top
   - Shows enabled looks only
   - Displays in order

### **URL:**
`/admin/slider`

---

## 5️⃣ **Filter Manager**

### **Purpose:**
Enable/disable filters on space and design pages.

### **3 Filters:**

#### **1. Look / Material**
- Filters by material type
- 9 options: Wood, Marble, Rattan, Fabric, Limewash, Pastel, Stone, Gold, Traditional
- Enabled by default

#### **2. Budget**
- Filters by price category
- 4 options: Economy, Minimal, Luxe, Statement
- Enabled by default

#### **3. Lighting Type**
- Filters by lighting style
- 3 options: Cove Light, Profile Light, Wall Washer Light
- Enabled by default

### **Features:**
- ✅ Enable/disable each filter
- ✅ See filter options
- ✅ View usage stats

### **How to Use:**

1. **Enable/Disable Filter:**
   - Click eye icon (👁️) on filter card
   - Enabled = Shows in filter modal
   - Disabled = Hidden from users
   - Click "Save Changes"

2. **View Options:**
   - See all available options
   - Options shown as pills
   - Count displayed

### **URL:**
`/admin/filters`

---

## 🔄 **How Everything Connects:**

### **Data Flow:**

```
1. Admin uploads design in Designs Library
   ↓
2. Tags design with:
   - Space (TV Unit, Living Room, etc.)
   - Look (Wood, Marble, etc.)
   - Budget (Economy, Luxe, etc.)
   - Lighting (Cove Light, etc.)
   ↓
3. Design appears on:
   - Space page (filtered by space tag)
   - Designs gallery (all designs)
   - Filtered by look, budget, lighting
   ↓
4. Users can filter designs using:
   - Look filter (if enabled)
   - Budget filter (if enabled)
   - Lighting filter (if enabled)
   ↓
5. Looks appear in:
   - Homepage slider (if enabled in Slider Manager)
   - Filter options (from Looks Manager)
```

### **Example Workflow:**

1. **Admin adds "Dark Oak Panel" design:**
   - Space: TV Unit Wall
   - Look: Wood
   - Budget: Luxe
   - Lighting: Cove Light
   - Price: ₹500/sq.ft

2. **Design appears:**
   - On TV Unit Wall space page
   - In designs gallery
   - Filterable by Wood, Luxe, Cove Light

3. **User visits TV Unit Wall page:**
   - Sees slideshow (from Spaces Manager)
   - Opens filter modal
   - Selects "Wood" + "Luxe"
   - Sees "Dark Oak Panel" design

---

## 📊 **Database Schema:**

### **Products Table:**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  image_url_2 TEXT,
  
  -- Tags
  space_category TEXT,      -- tv-unit, living-room, bedroom, entrance, study, mandir
  material_type TEXT,       -- Wood, Marble, Rattan, Fabric, Limewash, Pastel, Stone, Gold, Traditional
  style_category TEXT,      -- Economy, Minimal, Luxe, Statement
  lighting_type TEXT,       -- Cove Light, Profile Light, Wall Washer Light
  
  -- Pricing
  price_per_sqft DECIMAL(10,2),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_space ON products(space_category);
CREATE INDEX idx_products_material ON products(material_type);
CREATE INDEX idx_products_style ON products(style_category);
CREATE INDEX idx_products_lighting ON products(lighting_type);
CREATE INDEX idx_products_active ON products(is_active);
```

---

## 🎯 **Best Practices:**

### **Spaces Manager:**
- Use high-quality images (1200x600px minimum)
- Write clear, compelling descriptions
- Keep slideshow images consistent in style

### **Looks Manager:**
- Use descriptive names
- Choose distinct colors for each look
- Keep ID/slug lowercase and hyphenated
- Order by popularity or importance

### **Designs Library:**
- Always fill all required fields
- Use high-quality images
- Write detailed descriptions
- Tag accurately for proper filtering
- Set realistic prices
- Mark inactive if not ready

### **Slider Manager:**
- Enable 6-9 looks for best display
- Order by popularity
- Disable seasonal/temporary looks

### **Filter Manager:**
- Keep all 3 filters enabled for best UX
- Only disable if specific reason
- Monitor which filters users use most

---

## 🔐 **Security:**

### **Current Setup:**
- No authentication (development)
- All admin pages publicly accessible

### **Production Recommendations:**
1. Add authentication (NextAuth.js)
2. Protect `/admin` routes
3. Add role-based access control
4. Log all admin actions
5. Add confirmation for destructive actions

---

## 🚀 **Quick Start Guide:**

### **Day 1: Setup Spaces**
1. Go to Spaces Manager
2. Update descriptions for all 6 spaces
3. Add 3 slideshow images per space
4. Save changes

### **Day 2: Configure Looks**
1. Go to Looks Manager
2. Review default 9 looks
3. Add custom looks if needed
4. Reorder by importance
5. Save changes

### **Day 3: Upload Designs**
1. Go to Designs Library
2. Click "Upload Design"
3. Add 10-20 designs
4. Tag each design properly
5. Set prices
6. Mark as active

### **Day 4: Configure Slider**
1. Go to Slider Manager
2. Enable 6-9 looks
3. Reorder for best display
4. Save changes

### **Day 5: Test Filters**
1. Go to Filter Manager
2. Ensure all 3 filters enabled
3. Visit space pages
4. Test filtering
5. Verify designs appear correctly

---

## 📱 **Admin Panel URLs:**

- **Dashboard:** `/admin`
- **Spaces:** `/admin/spaces`
- **Looks:** `/admin/looks`
- **Designs:** `/admin/designs`
- **Slider:** `/admin/slider`
- **Filters:** `/admin/filters`

---

## ✅ **Success Checklist:**

- [ ] All 6 spaces have descriptions
- [ ] All 6 spaces have 3 slideshow images
- [ ] 9 looks configured with colors
- [ ] At least 20 designs uploaded
- [ ] All designs properly tagged
- [ ] 6-9 looks enabled in slider
- [ ] All 3 filters enabled
- [ ] Tested filtering on space pages
- [ ] Tested designs gallery
- [ ] Verified homepage slider works

**All complete?** 🎉 **Admin panel ready!**
