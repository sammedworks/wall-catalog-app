'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutGrid, 
  Palette, 
  Image, 
  Sliders, 
  Filter,
  Home,
  LogOut
} from 'lucide-react';

const ADMIN_SECTIONS = [
  {
    id: 'spaces',
    name: 'Spaces Manager',
    description: 'Manage 6 fixed spaces',
    icon: LayoutGrid,
    href: '/admin/spaces',
    color: 'bg-blue-500'
  },
  {
    id: 'looks',
    name: 'Looks Manager',
    description: 'Add/edit material categories',
    icon: Palette,
    href: '/admin/looks',
    color: 'bg-purple-500'
  },
  {
    id: 'designs',
    name: 'Designs Library',
    description: 'Upload designs with tags',
    icon: Image,
    href: '/admin/designs',
    color: 'bg-green-500'
  },
  {
    id: 'slider',
    name: 'Slider Manager',
    description: 'Control Explore-by-View slider',
    icon: Sliders,
    href: '/admin/slider',
    color: 'bg-orange-500'
  },
  {
    id: 'filters',
    name: 'Filter Manager',
    description: 'Enable/disable filters',
    icon: Filter,
    href: '/admin/filters',
    color: 'bg-red-500'
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalDesigns: 0,
    totalSpaces: 6,
    totalLooks: 9,
    activeFilters: 3
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      setStats(prev => ({ ...prev, totalDesigns: count || 0 }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Wall Catalog Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Home className="w-4 h-4" />
                <span className="font-medium">View Site</span>
              </Link>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Admin Dashboard
          </h2>
          <p className="text-gray-600 text-lg">
            Manage your wall catalog, designs, and filters from one place
          </p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ADMIN_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.id}
                href={section.href}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-gray-200"
              >
                <div className="p-6">
                  <div className={`w-14 h-14 ${section.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {section.name}
                  </h3>
                  <p className="text-gray-600">
                    {section.description}
                  </p>
                </div>
                <div className="px-6 pb-6">
                  <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                    Manage
                    <span className="ml-1 group-hover:ml-0 transition-all">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalSpaces}</div>
            <div className="text-gray-600 font-medium">Fixed Spaces</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalLooks}</div>
            <div className="text-gray-600 font-medium">Look Categories</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDesigns}</div>
            <div className="text-gray-600 font-medium">Total Designs</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeFilters}</div>
            <div className="text-gray-600 font-medium">Active Filters</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/admin/designs"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Upload New Design</div>
                  <div className="text-sm text-gray-600">Add designs to your library</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              href="/admin/looks"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Manage Looks</div>
                  <div className="text-sm text-gray-600">Edit material categories</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
            <Link
              href="/admin/slider"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Configure Slider</div>
                  <div className="text-sm text-gray-600">Control homepage slider</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
