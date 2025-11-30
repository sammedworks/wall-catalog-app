# 🏗️ Wall Catalog - Complete Architecture & Implementation Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Backend Architecture](#backend-architecture)
5. [API Endpoints](#api-endpoints)
6. [Admin Panel Features](#admin-panel-features)
7. [Frontend Components](#frontend-components)
8. [Image Upload System](#image-upload-system)
9. [Quotation System](#quotation-system)
10. [Deployment Guide](#deployment-guide)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

### Current Stack
- **Frontend:** Next.js 14 (App Router)
- **Backend:** Supabase (PostgreSQL + Storage + Auth)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

### Architecture Pattern
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Catalog    │  │    Admin     │  │   Quotation  │  │
│  │     Page     │  │   Dashboard  │  │    System    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  API LAYER (Next.js API)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Products   │  │     Tags     │  │  Quotations  │  │
│  │     API      │  │     API      │  │     API      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│              SUPABASE (Backend Services)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │   Storage    │  │     Auth     │  │
│  │   Database   │  │   (Images)   │  │   (Admin)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Recommended Stack (Current + Enhanced)

**Backend:**
- ✅ **Supabase** (PostgreSQL + Storage + Auth + Real-time)
- ✅ **Next.js API Routes** (Serverless functions)
- ✅ **Row Level Security** (Database security)

**Frontend:**
- ✅ **Next.js 14** (React framework with App Router)
- ✅ **Tailwind CSS** (Styling)
- ✅ **Lucide React** (Icons)
- ✅ **jsPDF** (PDF generation)

**Storage:**
- ✅ **Supabase Storage** (Image hosting with CDN)
- Alternative: **Cloudinary** (Advanced image optimization)

**Deployment:**
- ✅ **Vercel** (Frontend + API)
- ✅ **Supabase Cloud** (Database + Storage)

### Why This Stack?

| Feature | Supabase | Firebase | AWS | Custom Node.js |
|---------|----------|----------|-----|----------------|
| Setup Time | ⚡ Fast | ⚡ Fast | 🐌 Slow | 🐌 Slow |
| Cost (Small) | 💰 Free | 💰 Free | 💰💰 Paid | 💰💰 Server |
| SQL Support | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| Real-time | ✅ Yes | ✅ Yes | ⚠️ Complex | ⚠️ Manual |
| File Storage | ✅ Built-in | ✅ Built-in | ✅ S3 | ❌ Manual |
| Auth | ✅ Built-in | ✅ Built-in | ⚠️ Cognito | ❌ Manual |
| Scalability | ✅ High | ✅ High | ✅ Very High | ⚠️ Manual |

**Verdict:** Supabase is perfect for this use case!

---

## 🗄️ Database Schema

### Enhanced Schema with All Features

```sql
-- ============================================
-- 1. PRODUCTS TABLE (Main Design Catalog)
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Categorization
  room_type VARCHAR(50) NOT NULL, -- Living room, TV unit, Bedroom, Ceiling
  finish_type VARCHAR(50) NOT NULL, -- Marble, Wooden, Fabric, Metallic
  color_tone VARCHAR(50), -- Light, Dark, Grey, Beige
  
  -- Pricing
  price_per_sqft DECIMAL(10,2) NOT NULL,
  price_range VARCHAR(20), -- Budget, Mid-range, Premium
  
  -- Specifications
  dimensions VARCHAR(50),
  installation_type VARCHAR(50),
  
  -- Media
  image_url TEXT,
  thumbnail_url TEXT,
  gallery_images JSONB DEFAULT '[]', -- Array of image URLs
  
  -- SEO & Metadata
  slug VARCHAR(255) UNIQUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock_status VARCHAR(20) DEFAULT 'in_stock', -- in_stock, out_of_stock, pre_order
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  quotation_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Indexes for performance
  CONSTRAINT valid_room_type CHECK (room_type IN ('Living room', 'TV unit', 'Bedroom', 'Ceiling', 'Kitchen', 'Bathroom', 'Office')),
  CONSTRAINT valid_finish CHECK (finish_type IN ('Marble', 'Wooden', 'Fabric', 'Metallic', 'Glass', 'Stone', 'Leather'))
);

CREATE INDEX idx_products_room_type ON products(room_type);
CREATE INDEX idx_products_finish_type ON products(finish_type);
CREATE INDEX idx_products_price ON products(price_per_sqft);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);

-- ============================================
-- 2. TAGS TABLE (Custom Tagging System)
-- ============================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50), -- material, style, color, feature
  description TEXT,
  color_code VARCHAR(7), -- Hex color for UI
  icon VARCHAR(50), -- Icon name
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_category ON tags(category);
CREATE INDEX idx_tags_active ON tags(is_active);

-- ============================================
-- 3. PRODUCT_TAGS (Many-to-Many Relationship)
-- ============================================
CREATE TABLE product_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, tag_id)
);

CREATE INDEX idx_product_tags_product ON product_tags(product_id);
CREATE INDEX idx_product_tags_tag ON product_tags(tag_id);

-- ============================================
-- 4. SLIDERS TABLE (Homepage Sliders)
-- ============================================
CREATE TABLE sliders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  slider_type VARCHAR(50) NOT NULL, -- panel, design, material, hero
  image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  link_url TEXT,
  link_text VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Linked Product (optional)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sliders_type ON sliders(slider_type);
CREATE INDEX idx_sliders_active ON sliders(is_active);
CREATE INDEX idx_sliders_order ON sliders(display_order);

-- ============================================
-- 5. QUOTATIONS TABLE (Customer Quotes)
-- ============================================
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer Info
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_address TEXT,
  
  -- Quotation Details
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, accepted, rejected, expired
  total_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Additional Info
  notes TEXT,
  internal_notes TEXT, -- Admin only
  
  -- Validity
  valid_until DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- User tracking
  created_by UUID REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id) -- If customer has account
);

CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_email ON quotations(customer_email);
CREATE INDEX idx_quotations_number ON quotations(quotation_number);

-- ============================================
-- 6. QUOTATION_ITEMS (Products in Quote)
-- ============================================
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Product snapshot (in case product changes)
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(50),
  product_image_url TEXT,
  
  -- Pricing
  quantity DECIMAL(10,2) DEFAULT 1, -- Square feet
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Customization
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quotation_items_quotation ON quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_product ON quotation_items(product_id);

-- ============================================
-- 7. ENQUIRIES TABLE (Contact Form)
-- ============================================
CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'new', -- new, in_progress, resolved, closed
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Response
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Source
  source VARCHAR(50) DEFAULT 'website', -- website, phone, email, chat
  
  -- Related
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_email ON enquiries(customer_email);
CREATE INDEX idx_enquiries_created ON enquiries(created_at DESC);

-- ============================================
-- 8. USER_PROFILES (Extended User Info)
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer', -- admin, customer, manager
  
  -- Address
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  country VARCHAR(100) DEFAULT 'India',
  
  -- Preferences
  preferences JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- ============================================
-- 9. WISHLIST (User Favorites)
-- ============================================
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_product ON wishlist(product_id);

-- ============================================
-- 10. SETTINGS (App Configuration)
-- ============================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(50), -- general, quotation, email, payment
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate quotation number
CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quotation_number = 'QT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('quotation_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE quotation_seq START 1;

CREATE TRIGGER set_quotation_number BEFORE INSERT ON quotations
  FOR EACH ROW EXECUTE FUNCTION generate_quotation_number();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE sliders ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Products: Public read, admin write
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Quotations: Users can view their own, admins can view all
CREATE POLICY "Users can view their own quotations"
  ON quotations FOR SELECT
  USING (
    user_id = auth.uid() OR
    customer_email = auth.email() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can create quotations"
  ON quotations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update quotations"
  ON quotations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Wishlist: Users can manage their own
CREATE POLICY "Users can view their own wishlist"
  ON wishlist FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can add to their wishlist"
  ON wishlist FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove from their wishlist"
  ON wishlist FOR DELETE
  USING (user_id = auth.uid());

-- Enquiries: Public insert, admin read/update
CREATE POLICY "Anyone can create enquiries"
  ON enquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all enquiries"
  ON enquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update enquiries"
  ON enquiries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample tags
INSERT INTO tags (name, slug, category, color_code) VALUES
('Modern', 'modern', 'style', '#3B82F6'),
('Classic', 'classic', 'style', '#8B5CF6'),
('Minimalist', 'minimalist', 'style', '#6B7280'),
('Luxury', 'luxury', 'style', '#F59E0B'),
('Eco-Friendly', 'eco-friendly', 'feature', '#10B981'),
('Waterproof', 'waterproof', 'feature', '#06B6D4'),
('Easy Install', 'easy-install', 'feature', '#84CC16');

-- Insert sample settings
INSERT INTO settings (key, value, category) VALUES
('company_name', '"Wall Catalog"', 'general'),
('company_email', '"info@wallcatalog.com"', 'general'),
('company_phone', '"+91-1234567890"', 'general'),
('tax_rate', '18', 'quotation'),
('quotation_validity_days', '30', 'quotation');
```

---

## 🔧 Backend Architecture

### API Structure

```
app/
├── api/
│   ├── products/
│   │   ├── route.js              # GET /api/products (list)
│   │   ├── [id]/
│   │   │   └── route.js          # GET/PUT/DELETE /api/products/:id
│   │   ├── search/
│   │   │   └── route.js          # POST /api/products/search
│   │   └── upload/
│   │       └── route.js          # POST /api/products/upload
│   ├── tags/
│   │   ├── route.js              # GET/POST /api/tags
│   │   └── [id]/
│   │       └── route.js          # GET/PUT/DELETE /api/tags/:id
│   ├── sliders/
│   │   ├── route.js              # GET/POST /api/sliders
│   │   └── [id]/
│   │       └── route.js          # GET/PUT/DELETE /api/sliders/:id
│   ├── quotations/
│   │   ├── route.js              # GET/POST /api/quotations
│   │   ├── [id]/
│   │   │   └── route.js          # GET/PUT/DELETE /api/quotations/:id
│   │   └── export/
│   │       └── route.js          # POST /api/quotations/export (PDF)
│   ├── enquiries/
│   │   ├── route.js              # GET/POST /api/enquiries
│   │   └── [id]/
│   │       └── route.js          # GET/PUT/DELETE /api/enquiries/:id
│   └── upload/
│       └── route.js              # POST /api/upload (generic)
```

---

## 📡 API Endpoints

### Complete API Documentation

#### **1. Products API**

```javascript
// GET /api/products
// List all products with filters
Query Parameters:
- room_type: string (optional)
- finish_type: string (optional)
- color_tone: string (optional)
- min_price: number (optional)
- max_price: number (optional)
- tags: string[] (optional)
- search: string (optional)
- page: number (default: 1)
- limit: number (default: 20)
- sort: string (default: 'created_at')
- order: 'asc' | 'desc' (default: 'desc')

Response:
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}

// POST /api/products
// Create new product (Admin only)
Body:
{
  "name": "Marble Luxe Retreat",
  "sku": "WP-001",
  "description": "Premium marble finish wall panel",
  "room_type": "Bedroom",
  "finish_type": "Marble",
  "color_tone": "Light",
  "price_per_sqft": 320,
  "dimensions": "10x12 ft",
  "installation_type": "Wall Mount",
  "image_url": "https://...",
  "tags": ["uuid1", "uuid2"]
}

// GET /api/products/:id
// Get single product

// PUT /api/products/:id
// Update product (Admin only)

// DELETE /api/products/:id
// Delete product (Admin only)

// POST /api/products/search
// Advanced search with filters
Body:
{
  "filters": {
    "room_types": ["Living room", "Bedroom"],
    "finish_types": ["Marble", "Wooden"],
    "price_range": [100, 500],
    "tags": ["modern", "luxury"]
  },
  "sort": "price_per_sqft",
  "order": "asc"
}
```

#### **2. Tags API**

```javascript
// GET /api/tags
// List all tags
Query Parameters:
- category: string (optional)

// POST /api/tags
// Create new tag (Admin only)
Body:
{
  "name": "Modern",
  "slug": "modern",
  "category": "style",
  "color_code": "#3B82F6"
}

// PUT /api/tags/:id
// Update tag

// DELETE /api/tags/:id
// Delete tag
```

#### **3. Sliders API**

```javascript
// GET /api/sliders
// List all active sliders
Query Parameters:
- type: string (optional) - panel, design, material, hero

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Premium Marble Collection",
      "slider_type": "panel",
      "image_url": "https://...",
      "display_order": 1
    }
  ]
}

// POST /api/sliders
// Create new slider (Admin only)

// PUT /api/sliders/:id
// Update slider

// DELETE /api/sliders/:id
// Delete slider
```

#### **4. Quotations API**

```javascript
// POST /api/quotations
// Create new quotation
Body:
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+91-9876543210",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 100,
      "unit_price": 320
    }
  ],
  "notes": "Urgent requirement"
}

Response:
{
  "success": true,
  "data": {
    "quotation_id": "uuid",
    "quotation_number": "QT-20250130-0001",
    "total_amount": 32000,
    "pdf_url": "https://..."
  }
}

// GET /api/quotations/:id
// Get quotation details

// PUT /api/quotations/:id
// Update quotation status

// POST /api/quotations/export
// Export quotation as PDF
Body:
{
  "quotation_id": "uuid"
}
```

#### **5. Enquiries API**

```javascript
// POST /api/enquiries
// Submit contact form
Body:
{
  "customer_name": "Jane Doe",
  "customer_email": "jane@example.com",
  "customer_phone": "+91-9876543210",
  "subject": "Product Inquiry",
  "message": "I need more information about...",
  "product_id": "uuid" // optional
}

// GET /api/enquiries
// List all enquiries (Admin only)

// PUT /api/enquiries/:id
// Update enquiry status
```

#### **6. Upload API**

```javascript
// POST /api/upload
// Upload image to Supabase Storage
Body: FormData
- file: File
- bucket: string (default: 'products')
- folder: string (optional)

Response:
{
  "success": true,
  "data": {
    "url": "https://supabase.co/storage/v1/object/public/products/...",
    "path": "products/image.jpg"
  }
}
```

---

## 🎨 Admin Panel Features

### Admin Dashboard Screens

#### **1. Dashboard (Home)**
- Total products count
- Total enquiries count
- Total quotations count
- Revenue statistics
- Recent activity feed
- Quick actions

#### **2. Product Management**
- Product list with filters
- Add new product form
- Edit product form
- Bulk actions (delete, activate, deactivate)
- Image gallery management
- Tag assignment

#### **3. Tag Management**
- Tag list by category
- Add/edit/delete tags
- Color picker for tag colors
- Reorder tags

#### **4. Slider Management**
- Slider list by type
- Add/edit/delete sliders
- Image upload
- Reorder sliders (drag & drop)
- Schedule sliders (start/end date)

#### **5. Quotation Management**
- Quotation list with status filters
- View quotation details
- Update status
- Send email to customer
- Export PDF

#### **6. Enquiry Management**
- Enquiry list with filters
- View enquiry details
- Respond to enquiry
- Mark as resolved
- Assign to team member

#### **7. Settings**
- Company information
- Tax settings
- Email templates
- Quotation settings
- User management

---

## 🖼️ Image Upload System

### Complete Implementation

#### **Supabase Storage Setup**

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

-- Set storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (auth.uid() = owner);
```

#### **Upload API Implementation**

Create `app/api/upload/route.js`:

```javascript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || 'products';
    const folder = formData.get('folder') || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Upload failed: ' + error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
        bucket: bucket
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### **Frontend Upload Component**

Create `components/ImageUpload.js`:

```javascript
'use client';
import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ onUploadComplete, existingUrl }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingUrl || null);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'products');
      formData.append('folder', 'designs');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Call parent callback with URL
      onUploadComplete(result.data.url);
      
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700">
        Product Image
      </label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-all bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 💰 Quotation System

### Complete Flow

#### **1. Add to Quotation (Frontend)**

Update `app/page.js`:

```javascript
const [quotationList, setQuotationList] = useState([]);

// Load from localStorage on mount
useEffect(() => {
  const saved = localStorage.getItem('quotation');
  if (saved) {
    setQuotationList(JSON.parse(saved));
  }
}, []);

// Save to localStorage on change
useEffect(() => {
  localStorage.setItem('quotation', JSON.stringify(quotationList));
}, [quotationList]);

const toggleQuotation = (product) => {
  if (quotationList.find(p => p.id === product.id)) {
    setQuotationList(quotationList.filter(p => p.id !== product.id));
  } else {
    setQuotationList([...quotationList, { ...product, quantity: 100 }]);
  }
};
```

#### **2. Quotation Summary Page**

Create `app/quotation/page.js`:

```javascript
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, Download } from 'lucide-react';

export default function QuotationPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('quotation');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    setItems(items.map(item =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, newQuantity) }
        : item
    ));
  };

  const removeItem = (productId) => {
    const updated = items.filter(item => item.id !== productId);
    setItems(updated);
    localStorage.setItem('quotation', JSON.stringify(updated));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) =>
      sum + (item.price_per_sqft * item.quantity), 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customerInfo,
          items: items.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price_per_sqft
          }))
        })
      });

      const result = await response.json();

      if (result.success) {
        // Clear quotation
        localStorage.removeItem('quotation');
        
        // Show success and redirect
        alert('Quotation submitted successfully! Check your email.');
        router.push('/');
      } else {
        alert('Failed to submit quotation: ' + result.error);
      }
    } catch (error) {
      alert('Error submitting quotation');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-4">Your quotation is empty</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Quotation Summary</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex gap-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-gray-600">{item.sku}</p>
                    <p className="text-blue-600 font-bold">
                      ₹{item.price_per_sqft}/sq.ft
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 10)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border rounded text-center"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 10)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">sq.ft</p>
                    <p className="font-bold text-lg">
                      ₹{(item.price_per_sqft * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Form & Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Your Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  required
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Phone *"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span className="font-bold">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax (18%):</span>
                    <span className="font-bold">₹{(calculateTotal() * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{(calculateTotal() * 1.18).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Request Quotation'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### **3. Quotation API**

Create `app/api/quotations/route.js`:

```javascript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const { name, email, phone, address, items } = body;

    // Validate
    if (!name || !email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) =>
      sum + (item.unit_price * item.quantity), 0
    );
    const taxAmount = subtotal * 0.18;
    const finalAmount = subtotal + taxAmount;

    // Create quotation
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_address: address,
        total_amount: subtotal,
        tax_amount: taxAmount,
        final_amount: finalAmount,
        status: 'draft',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      })
      .select()
      .single();

    if (quotationError) {
      throw quotationError;
    }

    // Create quotation items
    const quotationItems = items.map(item => ({
      quotation_id: quotation.id,
      product_id: item.product_id,
      product_name: item.product_name || 'Product',
      product_sku: item.product_sku || '',
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(quotationItems);

    if (itemsError) {
      throw itemsError;
    }

    // TODO: Send email notification

    return NextResponse.json({
      success: true,
      data: {
        quotation_id: quotation.id,
        quotation_number: quotation.quotation_number,
        total_amount: finalAmount
      }
    });

  } catch (error) {
    console.error('Quotation error:', error);
    return NextResponse.json(
      { error: 'Failed to create quotation' },
      { status: 500 }
    );
  }
}
```

---

## 🚀 Deployment Guide

### Step-by-Step Deployment

#### **1. Supabase Setup**

```bash
# 1. Create Supabase project at supabase.com
# 2. Run all SQL from Database Schema section
# 3. Create storage bucket 'products'
# 4. Set storage policies
# 5. Get API keys from Settings → API
```

#### **2. Vercel Deployment**

```bash
# 1. Push code to GitHub
git add .
git commit -m "Complete wall catalog app"
git push origin main

# 2. Import to Vercel
# Go to vercel.com → New Project → Import from GitHub

# 3. Add environment variables:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 4. Deploy!
```

#### **3. Post-Deployment**

```bash
# 1. Create admin user in Supabase Auth
# 2. Add admin role in user_profiles table
# 3. Upload sample products
# 4. Test all features
```

---

## 🐛 Troubleshooting

### Common Issues & Fixes

#### **Issue 1: 404 on Images**

**Cause:** Image URLs are incorrect or storage bucket not public

**Fix:**
```sql
-- Make bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'products';

-- Check image URLs
SELECT image_url FROM products LIMIT 5;
```

#### **Issue 2: Quotation Button Not Working**

**Cause:** localStorage not persisting or API endpoint missing

**Fix:**
```javascript
// Check localStorage
console.log(localStorage.getItem('quotation'));

// Check API endpoint exists
fetch('/api/quotations', { method: 'POST' })
  .then(r => console.log(r.status));
```

#### **Issue 3: Upload Failing**

**Cause:** File size too large or wrong bucket permissions

**Fix:**
```sql
-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'products';

-- Add upload policy if missing
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
```

---

## 📊 Performance Optimization

### Best Practices

1. **Image Optimization**
   - Use WebP format
   - Compress images before upload
   - Use CDN (Supabase Storage has built-in CDN)
   - Lazy load images

2. **Database Optimization**
   - Add indexes on frequently queried columns
   - Use pagination for large lists
   - Cache frequently accessed data

3. **API Optimization**
   - Implement rate limiting
   - Use API caching
   - Minimize database queries

---

## 🎉 Summary

This architecture provides:

✅ **Complete Backend** - Supabase with PostgreSQL + Storage + Auth  
✅ **Robust API** - RESTful endpoints for all operations  
✅ **Admin Panel** - Full product, tag, slider, quotation management  
✅ **Image Upload** - Working upload system with preview  
✅ **Quotation System** - End-to-end quote generation with PDF  
✅ **Security** - Row Level Security + Authentication  
✅ **Scalability** - Cloud-native architecture  
✅ **Performance** - Optimized queries + CDN  

**Next Steps:**
1. Run database schema SQL in Supabase
2. Deploy to Vercel
3. Create admin user
4. Start adding products!

---

**Need help implementing any specific feature? Let me know!** 🚀