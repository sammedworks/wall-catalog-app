# Wall Catalog App

Modern wall panel catalog system with quotation builder and admin panel.

## 🚀 Features

- **Home Page**: Explore by space and material looks
- **Area Pages**: Browse designs by room type
- **Material Slider**: Filter designs by material
- **Quotation Builder**: Create custom quotes
- **Admin Panel**: Manage designs, panels, and materials

## 📦 Tech Stack

- Next.js 14
- Supabase
- Tailwind CSS
- Lucide Icons

## 🎯 Pages

1. ✅ Home Page - Explore by Space + Looks
2. ✅ Area Page - Space-specific designs
3. ⏳ Design Detail Page
4. ⏳ Quotation Builder
5. ⏳ Admin Dashboard
6. ⏳ Admin - Upload Design
7. ⏳ Admin - Panel Management
8. ✅ Admin - Material Management
9. ⏳ Admin - Addon Management

## 🔧 Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Set up Supabase credentials in `.env.local`
4. Run migration: `MIGRATION_MATERIALS_ONLY.sql`
5. Start dev server: `npm run dev`

## 📊 Database

Run the migration file to create:
- `materials` table (10 default materials)
- `products` table (designs)

## 🌐 Deployment

Deployed on Vercel with automatic deployments from main branch.

---

**Last Updated:** December 1, 2025
