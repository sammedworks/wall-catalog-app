'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterFinish, setFilterFinish] = useState('all');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoom = filterRoom === 'all' || product.room_type === filterRoom;
    const matchesFinish = filterFinish === 'all' || product.finish_type === filterFinish;
    
    return matchesSearch && matchesRoom && matchesFinish;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your wall panel designs</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Room Filter */}
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Rooms</option>
            <option value="Living room">Living Room</option>
            <option value="TV unit">TV Unit</option>
            <option value="Bedroom">Bedroom</option>
            <option value="Ceiling">Ceiling</option>
          </select>

          {/* Finish Filter */}
          <select
            value={filterFinish}
            onChange={(e) => setFilterFinish(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Finishes</option>
            <option value="Marble">Marble</option>
            <option value="Wooden">Wooden</option>
            <option value="Fabric">Fabric</option>
            <option value="Metallic">Metallic</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {products.filter(p => p.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Inactive</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {products.filter(p => !p.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Filtered Results</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{filteredProducts.length}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Room</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Finish</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sku}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {product.room_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {product.finish_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">₹{product.price_per_sqft}</p>
                      <p className="text-xs text-gray-500">per sq.ft</p>
                    </td>
                    <td className="px-6 py-4">
                      {product.is_active ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 hover:bg-green-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5 text-green-600" />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}