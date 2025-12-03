# 🎨 Design Library Module - Complete Implementation Guide

## 📋 **TABLE OF CONTENTS**

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Admin Pages Structure](#admin-pages-structure)
5. [Implementation Phases](#implementation-phases)
6. [Features Checklist](#features-checklist)
7. [Testing Guide](#testing-guide)
8. [Deployment Steps](#deployment-steps)

---

## 🎯 **OVERVIEW**

The Design Library is a comprehensive module for managing interior design catalogs with:
- **11 database tables** with full relationships
- **RESTful API** with pagination, filtering, search
- **Admin Dashboard** with metrics and quick actions
- **CRUD operations** for designs, categories, tags, media
- **Pricing rules** and quotation integration
- **Analytics** and activity tracking
- **Bulk import/export** capabilities
- **Role-based access control**

---

## 🗄️ **DATABASE SCHEMA**

### **Tables Created:**

#### **1. design_categories**
Hierarchical categories for organizing designs.

```sql
- id (UUID, PK)
- name (VARCHAR)
- slug (VARCHAR, UNIQUE)
- description (TEXT)
- icon (VARCHAR)
- color_code (VARCHAR)
- parent_id (UUID, FK → design_categories)
- display_order (INTEGER)
- is_visible (BOOLEAN)
- is_active (BOOLEAN)
- seo_title, seo_description
- created_at, updated_at
```

#### **2. design_tags**
Tags for filtering and classification.

```sql
- id (UUID, PK)
- name (VARCHAR)
- slug (VARCHAR, UNIQUE)
- description (TEXT)
- color_code (VARCHAR)
- tag_group (VARCHAR) -- Material, Style, Price Tier
- display_order (INTEGER)
- is_active (BOOLEAN)
- created_at, updated_at
```

#### **3. area_types**
Room/area types (TV Unit, Living Room, etc.).

```sql
- id (UUID, PK)
- name (VARCHAR)
- slug (VARCHAR, UNIQUE)
- description (TEXT)
- icon (VARCHAR)
- display_order (INTEGER)
- is_active (BOOLEAN)
- created_at, updated_at
```

**Default area types:**
- TV Unit
- Living Room
- Bedroom
- Entrance
- Study
- Mandir
- Kitchen
- Bathroom

#### **4. designs** (Main Table)
Core design information.

```sql
- id (UUID, PK)
- title (VARCHAR)
- slug (VARCHAR, UNIQUE)
- short_description (TEXT)
- long_description (TEXT) -- Rich text/HTML
- sku (VARCHAR, UNIQUE)
- area_type_id (UUID, FK)
- category_id (UUID, FK)
- starting_price (DECIMAL)
- max_price (DECIMAL)
- rate_per_sqft (DECIMAL)
- pricing_type (VARCHAR) -- fixed, per_sqft, custom
- materials (JSONB) -- Array
- style (VARCHAR)
- lighting_type (VARCHAR)
- level (VARCHAR) -- economy, luxe, minimal, statement
- min_area_sqft, max_area_sqft (DECIMAL)
- recommended_dimensions (JSONB)
- hero_image_url (TEXT)
- hero_image_order (JSONB)
- gallery_images (JSONB)
- video_url (TEXT)
- seo_title, seo_description, seo_keywords
- status (VARCHAR) -- draft, published, archived
- is_featured (BOOLEAN)
- published_at, scheduled_publish_at (TIMESTAMPTZ)
- version (INTEGER)
- parent_version_id (UUID, FK)
- view_count, save_count, share_count, conversion_count
- created_by, updated_by (UUID)
- created_at, updated_at
```

#### **5. design_tag_relations**
Many-to-many relationship between designs and tags.

```sql
- id (UUID, PK)
- design_id (UUID, FK)
- tag_id (UUID, FK)
- created_at
- UNIQUE(design_id, tag_id)
```

#### **6. design_media**
Media library for design images/videos.

```sql
- id (UUID, PK)
- design_id (UUID, FK)
- file_name (VARCHAR)
- file_url (TEXT)
- file_type (VARCHAR) -- image, video, document
- mime_type (VARCHAR)
- file_size_kb (INTEGER)
- width, height (INTEGER)
- thumbnail_url, medium_url, large_url (TEXT)
- alt_text, caption (TEXT)
- is_primary (BOOLEAN)
- display_order (INTEGER)
- uploaded_by (UUID)
- created_at, updated_at
```

#### **7. design_product_relations**
Links designs to products/add-ons.

```sql
- id (UUID, PK)
- design_id (UUID, FK)
- product_id (UUID, FK)
- product_type (VARCHAR)
- quantity (INTEGER)
- position_metadata (JSONB)
- is_optional (BOOLEAN)
- override_price (DECIMAL)
- pricing_formula (TEXT)
- created_at, updated_at
```

#### **8. design_pricing_rules**
Dynamic pricing rules and discounts.

```sql
- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- rule_type (VARCHAR) -- discount, bulk, seasonal, custom
- applies_to (VARCHAR) -- all, category, tag, specific_design
- target_ids (JSONB)
- condition_type (VARCHAR)
- condition_value (JSONB)
- discount_type (VARCHAR)
- discount_value (DECIMAL)
- discount_formula (TEXT)
- valid_from, valid_until (TIMESTAMPTZ)
- is_active (BOOLEAN)
- priority (INTEGER)
- created_at, updated_at
```

#### **9. design_activity_log**
Audit trail for all design operations.

```sql
- id (UUID, PK)
- design_id (UUID, FK)
- action (VARCHAR) -- created, updated, published, deleted, viewed
- action_by (UUID)
- action_by_name, action_by_email (VARCHAR)
- changes (JSONB) -- Before/after values
- ip_address (INET)
- user_agent (TEXT)
- created_at
```

#### **10. design_analytics**
Daily analytics per design.

```sql
- id (UUID, PK)
- design_id (UUID, FK)
- date (DATE)
- views, unique_views (INTEGER)
- saves, shares (INTEGER)
- quotation_requests, conversions (INTEGER)
- avg_time_spent_seconds (INTEGER)
- bounce_rate (DECIMAL)
- created_at, updated_at
- UNIQUE(design_id, date)
```

#### **11. design_library_settings**
Configurable settings.

```sql
- id (UUID, PK)
- setting_key (VARCHAR, UNIQUE)
- setting_value (JSONB)
- setting_type (VARCHAR)
- description (TEXT)
- is_public (BOOLEAN)
- updated_by (UUID)
- created_at, updated_at
```

### **Indexes Created:**
- Slug indexes for fast lookups
- Foreign key indexes
- Full-text search index on designs
- Status, category, area_type indexes
- Date-based indexes for analytics

### **Helper Functions:**
- `increment_design_views(design_uuid)` - Increment view count
- `publish_design(design_uuid, publisher_uuid)` - Publish design
- `get_design_full_details(design_uuid)` - Get complete design data

---

## 🔌 **API ENDPOINTS**

### **Designs API**

#### **GET /api/designs**
List all designs with filtering, search, pagination.

**Query Parameters:**
```
page=1                    // Page number
limit=20                  // Results per page
status=published          // draft, published, archived
category=uuid             // Category ID
area_type=uuid            // Area type ID
tags=uuid1,uuid2          // Comma-separated tag IDs
featured=true             // Filter featured designs
search=keyword            // Search in title, description, SKU
min_price=1000            // Minimum price
max_price=50000           // Maximum price
style=modern              // Style filter
level=luxe                // Level filter
sort_by=created_at        // Sort field
sort_order=desc           // asc or desc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Modern TV Unit",
      "slug": "modern-tv-unit",
      "short_description": "...",
      "starting_price": 45000,
      "status": "published",
      "is_featured": true,
      "hero_image_url": "...",
      "category": { "name": "Modern", "color_code": "#3B82F6" },
      "area_type": { "name": "TV Unit" },
      "tags": [
        { "name": "Wood", "tag_group": "Material" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

#### **POST /api/designs**
Create new design.

**Request Body:**
```json
{
  "title": "Modern TV Unit",
  "short_description": "Contemporary TV unit design",
  "long_description": "<p>Full HTML description</p>",
  "area_type_id": "uuid",
  "category_id": "uuid",
  "tags": ["tag-uuid-1", "tag-uuid-2"],
  "starting_price": 45000,
  "pricing_type": "fixed",
  "materials": ["Wood", "Glass"],
  "style": "Modern",
  "level": "luxe",
  "hero_image_url": "https://...",
  "status": "draft",
  "is_featured": false
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* created design */ },
  "message": "Design created successfully"
}
```

#### **GET /api/designs/[id]**
Get single design with full details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Modern TV Unit",
    /* ... all design fields ... */
    "category": { /* category details */ },
    "area_type": { /* area type details */ },
    "tags": [ /* array of tags */ ],
    "media": [ /* array of media files */ ],
    "products": [ /* linked products */ ]
  }
}
```

#### **PUT /api/designs/[id]**
Update design.

**Request Body:** Same as POST, all fields optional.

**Response:**
```json
{
  "success": true,
  "data": { /* updated design */ },
  "message": "Design updated successfully"
}
```

#### **DELETE /api/designs/[id]**
Delete design (soft delete recommended).

**Response:**
```json
{
  "success": true,
  "message": "Design deleted successfully"
}
```

### **Additional Endpoints Needed:**

#### **Categories API**
- `GET /api/design-categories` - List categories
- `POST /api/design-categories` - Create category
- `PUT /api/design-categories/[id]` - Update category
- `DELETE /api/design-categories/[id]` - Delete category

#### **Tags API**
- `GET /api/design-tags` - List tags
- `POST /api/design-tags` - Create tag
- `PUT /api/design-tags/[id]` - Update tag
- `DELETE /api/design-tags/[id]` - Delete tag

#### **Media API**
- `POST /api/design-media/upload` - Upload media
- `GET /api/design-media` - List media
- `DELETE /api/design-media/[id]` - Delete media

#### **Pricing Rules API**
- `GET /api/design-pricing-rules` - List rules
- `POST /api/design-pricing-rules` - Create rule
- `PUT /api/design-pricing-rules/[id]` - Update rule
- `DELETE /api/design-pricing-rules/[id]` - Delete rule

#### **Analytics API**
- `GET /api/design-analytics/[id]` - Get design analytics
- `GET /api/design-analytics/summary` - Overall analytics

#### **Bulk Operations API**
- `POST /api/designs/import` - Bulk import
- `GET /api/designs/export` - Bulk export

---

## 📱 **ADMIN PAGES STRUCTURE**

### **Sidebar Navigation:**

```
Design Library
├── Dashboard (/)
├── All Designs (/all)
├── Add Design (/add)
├── Edit Design (/edit/[id])
├── Categories & Tags (/categories)
├── Products & Add-ons (/products)
├── Media Library (/media)
├── Pricing Rules (/pricing)
├── Bulk Import/Export (/import)
├── Analytics (/analytics)
└── Settings (/settings)
```

### **Page Descriptions:**

#### **1. Dashboard** (`/admin/design-library`)
✅ **CREATED**

**Features:**
- Stats cards (total, published, draft, featured, views)
- Quick action buttons
- Recent designs list
- Category distribution
- Recent activity log

**Components:**
- Stat cards with icons
- Quick action grid
- Recent designs table
- Category chart
- Activity timeline

#### **2. All Designs** (`/admin/design-library/all`)
**TO BE CREATED**

**Features:**
- Data table with all designs
- Advanced filters (status, category, tags, price, date)
- Search functionality
- Bulk actions (publish, delete, feature)
- Sorting options
- Pagination
- Quick edit inline
- Preview modal

**Components:**
- Filter sidebar
- Search bar
- Data table with actions
- Bulk action toolbar
- Pagination controls

#### **3. Add/Edit Design** (`/admin/design-library/add`, `/edit/[id]`)
**TO BE CREATED**

**Features:**
- Multi-step form or tabbed interface
- Rich text editor for descriptions
- Image upload with drag-drop
- Category & tag multi-select
- Pricing configuration
- SEO fields
- Preview mode (desktop/mobile)
- Save as draft / Publish
- Schedule publish
- Version history

**Form Sections:**
1. **Basic Info:** Title, SKU, area type, category
2. **Description:** Short & long description (WYSIWYG)
3. **Media:** Hero images, gallery, video
4. **Pricing:** Starting price, rate/sqft, pricing type
5. **Attributes:** Materials, style, lighting, level
6. **Dimensions:** Min/max area, recommended dimensions
7. **Products:** Link products and add-ons
8. **Tags:** Multi-select tags
9. **SEO:** Slug, meta title, meta description
10. **Publishing:** Status, featured, schedule

#### **4. Categories & Tags** (`/admin/design-library/categories`)
**TO BE CREATED**

**Features:**
- Two-tab interface (Categories | Tags)
- CRUD for categories
- CRUD for tags
- Hierarchical category tree
- Tag groups management
- Color picker for visual identity
- Icon selector
- Bulk operations
- Drag-drop reordering

#### **5. Products & Add-ons** (`/admin/design-library/products`)
**TO BE CREATED**

**Features:**
- Product catalog management
- Link products to designs
- Quantity and position metadata
- Optional vs required products
- Price overrides
- Product categories
- Quick add from design editor

#### **6. Media Library** (`/admin/design-library/media`)
**TO BE CREATED**

**Features:**
- Grid view of all media
- Upload with drag-drop
- Bulk upload with progress
- Image cropping tool
- Automatic resizing (thumbnail, medium, large)
- Alt text editor
- Filter by type, date, design
- Search by filename
- Delete with confirmation
- Usage tracking (which designs use this media)

#### **7. Pricing Rules** (`/admin/design-library/pricing`)
**TO BE CREATED**

**Features:**
- List all pricing rules
- Create discount rules
- Bulk pricing rules
- Seasonal discounts
- Category-based pricing
- Tag-based pricing
- Date range validity
- Priority management
- Preview pricing impact
- Active/inactive toggle

#### **8. Bulk Import/Export** (`/admin/design-library/import`)
**TO BE CREATED**

**Features:**
- CSV/JSON import
- Column mapping interface
- Validation preview
- Error reporting
- Progress indicator
- Export to CSV/JSON
- Template download
- Import history
- Rollback capability

#### **9. Analytics** (`/admin/design-library/analytics`)
**TO BE CREATED**

**Features:**
- Overall metrics dashboard
- Per-design analytics
- Date range selector
- Views, saves, shares charts
- Conversion tracking
- Top performing designs
- Category performance
- Engagement metrics
- Export reports

#### **10. Settings** (`/admin/design-library/settings`)
**TO BE CREATED**

**Features:**
- General settings
- Default values
- Area type labels (customizable)
- Category labels
- Permissions & roles
- API settings
- Webhook configuration
- Email notifications
- Cache settings

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation** (Week 1) ✅ DONE
- [x] Database schema migration
- [x] Basic API endpoints (GET, POST, PUT, DELETE)
- [x] Dashboard page with stats
- [ ] Sidebar navigation integration

### **Phase 2: Core CRUD** (Week 2)
- [ ] All Designs page with table
- [ ] Add Design form (basic fields)
- [ ] Edit Design form
- [ ] Delete functionality
- [ ] Search and filters
- [ ] Pagination

### **Phase 3: Media & Categories** (Week 3)
- [ ] Media Library page
- [ ] Image upload functionality
- [ ] Categories & Tags management
- [ ] Tag assignment to designs
- [ ] Image gallery in design form

### **Phase 4: Advanced Features** (Week 4)
- [ ] Pricing Rules module
- [ ] Products & Add-ons integration
- [ ] Rich text editor for descriptions
- [ ] Preview mode (desktop/mobile)
- [ ] Publish workflow
- [ ] Schedule publishing

### **Phase 5: Bulk Operations** (Week 5)
- [ ] Bulk import (CSV/JSON)
- [ ] Column mapping
- [ ] Validation & error handling
- [ ] Bulk export
- [ ] Import history

### **Phase 6: Analytics & Polish** (Week 6)
- [ ] Analytics dashboard
- [ ] Activity tracking
- [ ] Performance metrics
- [ ] Settings page
- [ ] Permissions & roles
- [ ] UI/UX polish
- [ ] Mobile responsiveness

---

## ✅ **FEATURES CHECKLIST**

### **Database & Backend**
- [x] Database schema created
- [x] Migrations written
- [x] RLS policies configured
- [x] Helper functions created
- [x] Indexes optimized
- [x] Sample data inserted
- [ ] API rate limiting
- [ ] CORS configuration
- [ ] Webhooks setup

### **API Endpoints**
- [x] GET /api/designs (list with filters)
- [x] POST /api/designs (create)
- [x] GET /api/designs/[id] (get single)
- [x] PUT /api/designs/[id] (update)
- [x] DELETE /api/designs/[id] (delete)
- [ ] Categories API
- [ ] Tags API
- [ ] Media API
- [ ] Pricing Rules API
- [ ] Analytics API
- [ ] Bulk Import/Export API

### **Admin Pages**
- [x] Dashboard with stats
- [ ] All Designs table
- [ ] Add Design form
- [ ] Edit Design form
- [ ] Categories management
- [ ] Tags management
- [ ] Media Library
- [ ] Pricing Rules
- [ ] Bulk Import/Export
- [ ] Analytics
- [ ] Settings

### **Features**
- [ ] Search functionality
- [ ] Advanced filters
- [ ] Sorting options
- [ ] Pagination
- [ ] Bulk actions
- [ ] Image upload
- [ ] Rich text editor
- [ ] Preview mode
- [ ] Publish workflow
- [ ] Schedule publishing
- [ ] Version control
- [ ] Activity logging
- [ ] Analytics tracking
- [ ] Role-based access
- [ ] Audit trail

### **UI/UX**
- [x] Responsive design
- [x] Mobile-first approach
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Loading states
- [ ] Error handling
- [ ] Success messages
- [ ] Confirmation dialogs
- [ ] Tooltips
- [ ] Help text

### **Testing**
- [ ] Unit tests for API
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests
- [ ] Security tests
- [ ] Accessibility tests

---

## 🧪 **TESTING GUIDE**

### **Database Testing**

1. **Run Migration:**
   ```bash
   # In Supabase SQL Editor
   # Copy and run: supabase/migrations/004_design_library_schema.sql
   ```

2. **Verify Tables:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'design%';
   ```

3. **Check Sample Data:**
   ```sql
   SELECT * FROM area_types;
   SELECT * FROM design_categories;
   SELECT * FROM design_tags;
   ```

### **API Testing**

Use tools like Postman, Insomnia, or curl:

```bash
# List designs
curl http://localhost:3000/api/designs

# Get single design
curl http://localhost:3000/api/designs/[uuid]

# Create design (requires auth)
curl -X POST http://localhost:3000/api/designs \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Design","status":"draft"}'

# Update design
curl -X PUT http://localhost:3000/api/designs/[uuid] \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Delete design
curl -X DELETE http://localhost:3000/api/designs/[uuid]
```

### **Frontend Testing**

1. **Dashboard:**
   - Visit `/admin/design-library`
   - Verify stats load correctly
   - Check quick actions work
   - Test recent designs display
   - Verify category stats

2. **All Designs:**
   - Test search functionality
   - Apply various filters
   - Test sorting
   - Verify pagination
   - Test bulk actions

3. **Add/Edit Design:**
   - Fill all form fields
   - Upload images
   - Select categories/tags
   - Save as draft
   - Publish design
   - Schedule publish

4. **Media Library:**
   - Upload single image
   - Bulk upload
   - Crop images
   - Delete images
   - Search media

### **Performance Testing**

- List page should load < 500ms for 20 results
- Search should return results < 300ms
- Image upload should show progress
- Bulk operations should handle 100+ items

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Database Migration**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy `supabase/migrations/004_design_library_schema.sql`
4. Run migration
5. Verify all tables created

### **Step 2: Environment Variables**

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Step 3: Deploy Code**

```bash
git add .
git commit -m "Add Design Library module"
git push origin main
```

Vercel will auto-deploy.

### **Step 4: Test Production**

1. Visit production URL
2. Test dashboard loads
3. Test API endpoints
4. Verify database connection
5. Check RLS policies work

### **Step 5: Add Sample Data**

Use admin interface or SQL to add:
- Categories
- Tags
- Area types (already seeded)
- Sample designs

---

## 📚 **ADDITIONAL RESOURCES**

### **Files Created:**
1. `supabase/migrations/004_design_library_schema.sql` - Database schema
2. `app/api/designs/route.js` - List & Create API
3. `app/api/designs/[id]/route.js` - Get, Update, Delete API
4. `app/admin/design-library/page.js` - Dashboard page
5. `docs/DESIGN_LIBRARY_IMPLEMENTATION.md` - This guide

### **Next Steps:**
1. Create remaining admin pages
2. Implement media upload
3. Add rich text editor
4. Build import/export
5. Add analytics
6. Implement permissions

### **Priority Order:**
1. **High:** All Designs page, Add/Edit forms, Categories
2. **Medium:** Media Library, Pricing Rules, Products
3. **Low:** Analytics, Bulk Import, Advanced Settings

---

## 🎉 **SUMMARY**

### **What's Done:**
✅ Complete database schema (11 tables)
✅ API endpoints for designs CRUD
✅ Dashboard with stats and metrics
✅ Sample data and helper functions
✅ RLS policies and security
✅ Full documentation

### **What's Next:**
- Create remaining admin pages
- Implement media upload
- Add rich text editor
- Build import/export functionality
- Add analytics dashboard
- Implement role-based access

**The foundation is solid and ready for building the complete Design Library module!** 🚀
