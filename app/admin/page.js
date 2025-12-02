'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Package, 
  Mail, 
  FileText, 
  TrendingUp,
  DollarSign,
  Eye,
  Tag,
  Filter
} from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalDesigns: 0,
    totalMaterials: 0,
    totalTags: 0,
    totalEnquiries: 0,
    totalQuotations: 0,
    recentEnquiries: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get designs count
      const { count: designsCount } = await supabase
        .from('designs')
        .select('*', { count: 'exact', head: true });

      // Get materials count
      const { count: materialsCount } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true });

      // Get tags count
      const { count: tagsCount } = await supabase
        .from('design_tags')
        .select('*', { count: 'exact', head: true });

      // Get enquiries count
      const { count: enquiriesCount } = await supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true });

      // Get quotations count
      const { count: quotationsCount } = await supabase
        .from('quotations')
        .select('*', { count: 'exact', head: true });

      // Get recent enquiries
      const { data: recentEnquiries } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalProducts: productsCount || 0,
        totalDesigns: designsCount || 0,
        totalMaterials: materialsCount || 0,
        totalTags: tagsCount || 0,
        totalEnquiries: enquiriesCount || 0,
        totalQuotations: quotationsCount || 0,
        recentEnquiries: recentEnquiries || []
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Here's what's happening with your wall catalog today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Designs */}
        <Link href="/admin/products">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDesigns}</h3>
            <p className="text-gray-600 font-medium">Total Designs</p>
          </div>
        </Link>

        {/* Total Materials */}
        <Link href="/admin/materials">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-100 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Filter className="w-8 h-8 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalMaterials}</h3>
            <p className="text-gray-600 font-medium">Materials</p>
          </div>
        </Link>

        {/* Total Tags */}
        <Link href="/admin/tags">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-100 hover:shadow-xl hover:border-orange-300 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Tag className="w-8 h-8 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalTags}</h3>
            <p className="text-gray-600 font-medium">Design Tags</p>
          </div>
        </Link>

        {/* Total Enquiries */}
        <Link href="/admin/enquiries">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-100 hover:shadow-xl hover:border-green-300 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalEnquiries}</h3>
            <p className="text-gray-600 font-medium">Customer Enquiries</p>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/products">
            <div className="flex items-center gap-3 p-6 bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Manage Designs</p>
                <p className="text-sm text-gray-500">Add, edit, or remove designs</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/materials">
            <div className="flex items-center gap-3 p-6 bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all cursor-pointer">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Manage Materials</p>
                <p className="text-sm text-gray-500">Configure material categories</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/enquiries">
            <div className="flex items-center gap-3 p-6 bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-green-300 hover:shadow-xl transition-all cursor-pointer">
              <div className="p-3 bg-green-100 rounded-xl">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">View Enquiries</p>
                <p className="text-sm text-gray-500">Check customer messages</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Enquiries</h3>
          <Link href="/admin/enquiries">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              View All →
            </button>
          </Link>
        </div>

        {stats.recentEnquiries.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No enquiries yet</p>
            <p className="text-sm text-gray-400 mt-1">Customer enquiries will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.recentEnquiries.map((enquiry) => (
              <div 
                key={enquiry.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-gray-900">{enquiry.name}</p>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {enquiry.status || 'New'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{enquiry.email}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{enquiry.message}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500">
                    {new Date(enquiry.created_at).toLocaleDateString()}
                  </p>
                  <Link href={`/admin/enquiries`}>
                    <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Content Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Designs</span>
              <span className="font-bold text-gray-900">{stats.totalDesigns}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Materials</span>
              <span className="font-bold text-gray-900">{stats.totalMaterials}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tags</span>
              <span className="font-bold text-gray-900">{stats.totalTags}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Legacy Products</span>
              <span className="font-bold text-gray-900">{stats.totalProducts}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Enquiries</span>
              <span className="font-bold text-gray-900">{stats.totalEnquiries}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Quotations</span>
              <span className="font-bold text-gray-900">{stats.totalQuotations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-bold text-orange-600">
                {stats.recentEnquiries.filter(e => e.status === 'pending' || !e.status).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
