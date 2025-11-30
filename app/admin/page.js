'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Users, 
  FileText, 
  Mail, 
  LogOut, 
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalEnquiries: 0,
    totalQuotations: 0,
    recentEnquiries: []
  });

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      router.push('/');
      return;
    }

    setUser(user);
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
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
        totalEnquiries: enquiriesCount || 0,
        totalQuotations: quotationsCount || 0,
        recentEnquiries: recentEnquiries || []
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🏠
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Wall Catalog Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all"
              >
                View Catalog
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h2>
          <p className="text-gray-600">Here's what's happening with your wall catalog today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalProducts}</h3>
            <p className="text-gray-600 font-medium">Total Products</p>
          </div>

          {/* Total Enquiries */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalEnquiries}</h3>
            <p className="text-gray-600 font-medium">Customer Enquiries</p>
          </div>

          {/* Total Quotations */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalQuotations}</h3>
            <p className="text-gray-600 font-medium">Quotations</p>
          </div>

          {/* Revenue (Placeholder) */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">₹0</h3>
            <p className="text-gray-600 font-medium">Total Revenue</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Manage Products</p>
                <p className="text-sm text-gray-500">Add, edit, or remove products</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-green-300 hover:shadow-xl transition-all">
              <div className="p-3 bg-green-100 rounded-xl">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">View Enquiries</p>
                <p className="text-sm text-gray-500">Check customer messages</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">View Quotations</p>
                <p className="text-sm text-gray-500">Manage customer quotes</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Enquiries</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              View All →
            </button>
          </div>

          {stats.recentEnquiries.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No enquiries yet</p>
              <p className="text-gray-400 text-sm">Customer enquiries will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentEnquiries.map((enquiry) => (
                <div 
                  key={enquiry.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{enquiry.customer_name}</p>
                    <p className="text-sm text-gray-600">{enquiry.customer_email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(enquiry.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded-lg transition-all">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg transition-all">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-8 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">🚀 More Features Coming Soon!</h3>
          <p className="text-gray-600 mb-4">
            Product management, enquiry responses, analytics dashboard, and more...
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 shadow-md">
              📊 Analytics
            </span>
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 shadow-md">
              ✉️ Email Integration
            </span>
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 shadow-md">
              📱 Mobile App
            </span>
            <span className="px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 shadow-md">
              🔔 Notifications
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}