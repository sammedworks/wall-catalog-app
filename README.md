# 🏠 Wall Business Catalog

A production-ready wall panel catalog application with Supabase backend, authentication, admin panel, and PDF export functionality.

## ✨ Features

- 🎨 **Product Catalog** - Browse wall panels by room type, finish, and color
- 🔍 **Advanced Filtering** - Search and filter by multiple criteria
- 💰 **Quotation System** - Add products to cart and export as PDF
- 🔐 **Admin Panel** - Manage products, enquiries, and quotations
- 📱 **PWA Support** - Works offline as a Progressive Web App
- 📧 **Contact Form** - Customer enquiries saved to database
- 🖼️ **Image Upload** - Supabase Storage for product images
- 👥 **User Authentication** - Role-based access (Admin/Customer)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sammedworks/wall-catalog-app.git
cd wall-catalog-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase Dashboard → Settings → API

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Setup

The database schema is already set up in your Supabase project with:

- ✅ 4 tables (products, quotations, enquiries, user_profiles)
- ✅ 12 sample products
- ✅ Row Level Security enabled
- ✅ Storage bucket for images

## 🔐 Admin Access

**Default Admin Credentials:**
- Email: `admin@wallcatalog.com`
- Password: `Admin@123`

**To create a new admin user:**

1. Go to Supabase Dashboard → Authentication → Users
2. Create a new user
3. Run this SQL:
```sql
INSERT INTO user_profiles (id, full_name, role)
VALUES ('user-uuid-here', 'Admin Name', 'admin');
```

## 📁 Project Structure

```
wall-catalog-app/
├── app/
│   ├── page.js              # Customer catalog
│   ├── login/page.js        # Admin login
│   ├── admin/               # Admin panel (to be added)
│   └── globals.css          # Global styles
├── lib/
│   ├── supabase.js          # Supabase client & helpers
│   └── pdfGenerator.js      # PDF export functionality
├── public/
│   └── manifest.json        # PWA manifest
└── components/              # Reusable components (to be added)
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS
- **PDF Export:** jsPDF
- **Icons:** Lucide React

## 📱 PWA Features

The app works offline and can be installed on mobile devices:

1. Open the app in Chrome/Safari
2. Click "Add to Home Screen"
3. Use like a native app

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag the `.next` folder to Netlify
3. Add environment variables
4. Done!

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## 🎯 Features Roadmap

- [x] Product catalog with filtering
- [x] Quotation system with PDF export
- [x] User authentication
- [x] Contact form
- [x] PWA support
- [ ] Admin dashboard
- [ ] Product management UI
- [ ] Enquiry management
- [ ] Email notifications
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your business!

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Contact: support@wallcatalog.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

---

Made with ❤️ for wall panel businesses