'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  LayoutGrid, Plus, TrendingUp, Eye, Heart, Share2,
  FileText, Tag, Image, DollarSign, Settings, Upload,
  Filter, Search, Calendar, BarChart3
} from 'lucide-react';

export default function DesignLibraryDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    featured: 0,
    totalViews: 0,
    totalSaves: 0,
    recentDesigns: []
  });
  const [categoryStats, setCategoryStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch design counts
      const [
        { count: totalCount },
        { count: publishedCount },
        { count: draftCount },
        { count: featuredCount }
      ] = await Promise.all([
        supabase.from('designs').select('*', { count: 'exact', head: true }),
        supabase.from('designs').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('designs').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('designs').select('*', { count: 'exact', head: true }).eq('is_featured', true)
      ]);

      // Fetch aggregate stats
      const { data: aggregateData } = await supabase
        .from('designs')
        .select('view_count, save_count, share_count');

      const totalViews = aggregateData?.reduce((sum, d) => sum + (d.view_count || 0), 0) || 0;
      const totalSaves = aggregateData?.reduce((sum, d) => sum + (d.save_count || 0), 0) || 0;

      // Fetch recent designs
      const { data: recentDesigns } = await supabase
        .from('designs')
        .select(`
          id, title, slug, status, is_featured, hero_image_url,
          starting_price, view_count, created_at,
          category:design_categories(name, color_code),
          area_type:area_types(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch category stats
      const { data: categories } = await supabase
        .from('design_categories')
        .select(`
          id, name, slug, color_code,
          designs:designs(count)
        `)
        .eq('is_active', true)
        .order('name');

      const categoryStats = categories?.map(cat => ({
        ...cat,
        designCount: cat.designs?.[0]?.count || 0
      })) || [];

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('design_activity_log')
        .select(`
          id, action, action_by_email, created_at,
          design:designs(title)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        total: totalCount || 0,
        published: publishedCount || 0,
        draft: draftCount || 0,
        featured: featuredCount || 0,
        totalViews,
        totalSaves,
        recentDesigns: recentDesigns || []
      });

      setCategoryStats(categoryStats);
      setRecentActivity(activity || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutGrid className="w-10 h-10 text-blue-600" />
            Design Library
          </h1>
          <p className="text-gray-600 mt-2">Manage your design catalog, categories, and media</p>
        </div>
        <Link
          href="/admin/design-library/add"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Design
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Designs */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Designs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <LayoutGrid className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <Link
            href="/admin/design-library/all"
            className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            View all designs →
          </Link>
        </div>

        {/* Published */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Published</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.published}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.draft} drafts</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <Link
            href="/admin/design-library/all?status=published"
            className="text-sm text-green-600 hover:text-green-700 mt-4 inline-block"
          >
            View published →
          </Link>
        </div>

        {/* Featured */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Featured</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.featured}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <Link
            href="/admin/design-library/all?featured=true"
            className="text-sm text-yellow-600 hover:text-yellow-700 mt-4 inline-block"
          >
            View featured →
          </Link>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Views</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.totalSaves} saves</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <Link
            href="/admin/design-library/analytics"
            className="text-sm text-purple-600 hover:text-purple-700 mt-4 inline-block"
          >
            View analytics →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Link
            href="/admin/design-library/all"
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-all"
          >
            <LayoutGrid className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">All Designs</span>
          </Link>

          <Link
            href="/admin/design-library/add"
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-all"
          >
            <Plus className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Add Design</span>
          </Link>

          <Link
            href="/admin/design-library/categories"
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-all"
          >
            <Tag className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Categories</span>
          </Link>

          <Link
            href="/admin/design-library/media"
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-all"
          >
            <Image className="w-8 h-8 text-pink-600" />
            <span className="text-sm font-medium text-gray-700">Media</span>
          </Link>

          <Link
            href="/admin/design-library/pricing"
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-all"
          >
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">Pricing</span>
          </Link>

          <Link
            href="/admin/design-library/import"
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-all"
          >
            <Upload className="w-8 h-8 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Import</span>
          </Link>

          <Link
            href="/admin/design-library/analytics"
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-all"
          >
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Analytics</span>
          </Link>

          <Link
            href="/admin/design-library/settings"
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-all"
          >
            <Settings className="w-8 h-8 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Settings</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Designs */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Designs</h2>
            <Link
              href="/admin/design-library/all"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentDesigns.map((design) => (
              <Link
                key={design.id}
                href={`/admin/design-library/edit/${design.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all"
              >
                {design.hero_image_url ? (
                  <img
                    src={design.hero_image_url}
                    alt={design.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{design.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      design.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {design.status}
                    </span>
                    {design.is_featured && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        Featured
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {design.view_count}
                    </span>
                  </div>
                </div>
                {design.starting_price && (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{design.starting_price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">starting</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Categories Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Designs by Category</h2>
            <Link
              href="/admin/design-library/categories"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Manage →
            </Link>
          </div>
          <div className="space-y-3">
            {categoryStats.slice(0, 6).map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color_code || '#3B82F6' }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {category.designCount} designs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.slice(0, 8).map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50"
            >
              <div className={`p-2 rounded-lg ${
                activity.action === 'created' ? 'bg-green-100' :
                activity.action === 'updated' ? 'bg-blue-100' :
                activity.action === 'published' ? 'bg-purple-100' :
                'bg-red-100'
              }`}>
                {activity.action === 'created' && <Plus className="w-4 h-4 text-green-600" />}
                {activity.action === 'updated' && <FileText className="w-4 h-4 text-blue-600" />}
                {activity.action === 'published' && <TrendingUp className="w-4 h-4 text-purple-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.design?.title}</span>
                  {' '}was {activity.action}
                </p>
                <p className="text-xs text-gray-500">
                  by {activity.action_by_email} • {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
