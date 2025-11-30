'use client';
import { useState } from 'react';
import { signIn, supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Check Supabase connection on mount
  useState(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setConnectionStatus('error');
        setError('Environment variables not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel settings.');
        return;
      }

      // Test connection
      const { error } = await supabase.from('products').select('id').limit(1);
      
      if (error) {
        setConnectionStatus('error');
        setError('Cannot connect to database. Please check your Supabase configuration.');
      } else {
        setConnectionStatus('connected');
      }
    } catch (err) {
      setConnectionStatus('error');
      setError('Failed to connect to Supabase: ' + err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase environment variables are not configured. Please add them in Vercel settings.');
      }

      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before logging in.');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          setError('User profile not found. Please contact administrator.');
          setLoading(false);
          return;
        }

        if (profile.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Success - redirect to admin panel
        router.push('/admin');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
            <span className="text-5xl">🏠</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Wall Catalog</h1>
          <p className="text-gray-600 text-lg">Admin Portal</p>
        </div>

        {/* Connection Status */}
        {connectionStatus === 'checking' && (
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-blue-800">Checking connection...</p>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800 mb-1">Connection Error</p>
                <p className="text-xs text-red-700">Please ensure environment variables are set in Vercel.</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="admin@wallcatalog.com"
                disabled={connectionStatus === 'error'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                  disabled={connectionStatus === 'error'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || connectionStatus === 'error'}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              ← Back to Catalog
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
          <h3 className="font-bold text-sm text-gray-900 mb-3">Need Help?</h3>
          
          <div className="space-y-3 text-xs text-gray-600">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-900 mb-1">Default Credentials:</p>
              <p className="font-mono text-blue-800">Email: admin@wallcatalog.com</p>
              <p className="font-mono text-blue-800">Password: Admin@123</p>
            </div>

            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="font-semibold text-yellow-900 mb-1">⚠️ First Time Setup:</p>
              <p className="text-yellow-800">1. Create user in Supabase Auth</p>
              <p className="text-yellow-800">2. Add admin role in user_profiles table</p>
              <p className="text-yellow-800">3. Set environment variables in Vercel</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-1">Environment Variables Required:</p>
              <p className="font-mono text-xs text-gray-700">NEXT_PUBLIC_SUPABASE_URL</p>
              <p className="font-mono text-xs text-gray-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}