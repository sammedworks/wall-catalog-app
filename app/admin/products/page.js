'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Search, Image as ImageIcon } from 'lucide-react';

export default function DesignsLibraryPage() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpace, setFilterSpace] = useState('all');
  const [filterLook, setFilterLook] = useState('all');

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (error) {
      console.error('Error loading designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setDesigns(designs.map(d => 
        d.id === id ? { ...d, is_active: !currentStatus } : d
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status');
    }
  };

  const deleteDesign = async (id) => {
    if (!confirm('Are you sure you want to delete this design? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDesigns(designs.filter(d => d.id !== id));
      alert('Design deleted successfully!');
    } catch (error) {
      console.error('Error deleting design:', error);
      alert('Failed to delete design');
    }
  };

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpace = filterSpace === 'all' || design.space_category === filterSpace;
    const matchesLook = filterLook === 'all' || design.material_type === filterLook;
    
    return matchesSearch && matchesSpace && matchesLook;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading designs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Designs Library</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage all your wall design collection</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add New Design
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
              placeholder="Search designs by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Space Filter */}
          <select
            value={filterSpace}
            onChange={(e) => setFilterSpace(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
          >
            <option value="all">All Spaces</option>
            <option value="tv-unit">TV Unit</option>
            <option value="living-room">Living Room</option>
            <option value="bedroom">Bedroom</option>
            <option value="entrance">Entrance</option>
            <option value="study">Study</option>
            <option value="mandir">Mandir</option>
          </select>

          {/* Look Filter */}
          <select
            value={filterLook}
            onChange={(e) => setFilterLook(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
          >
            <option value="all">All Looks / Materials</option>
            <option value="Wood">Wood</option>
            <option value="Marble">Marble</option>
            <option value="Rattan">Rattan</option>
            <option value="Fabric">Fabric</option>
            <option value="Limewash">Limewash</option>
            <option value="Pastel">Pastel</option>
            <option value="Stone">Stone</option>
            <option value="Gold">Gold</option>
            <option value="Traditional">Traditional</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Total Designs</p>
          <p className="text-4xl font-bold mt-2">{designs.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm font-semibold uppercase tracking-wide">Active</p>
          <p className="text-4xl font-bold mt-2">
            {designs.filter(d => d.is_active).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-red-100 text-sm font-semibold uppercase tracking-wide">Inactive</p>
          <p className="text-4xl font-bold mt-2">
            {designs.filter(d => !d.is_active).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm font-semibold uppercase tracking-wide">Filtered</p>
          <p className="text-4xl font-bold mt-2">{filteredDesigns.length}</p>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredDesigns.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No designs found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterSpace !== 'all' || filterLook !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first design'}
            </p>
            {(searchTerm || filterSpace !== 'all' || filterLook !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSpace('all');
                  setFilterLook('all');
                }}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Design Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Space</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Look / Material</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDesigns.map((design) => (
                  <tr key={design.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={design.image_url || '/placeholder.png'}
                          alt={design.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-lg">{design.name}</p>
                      {design.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{design.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {design.space_category ? (
                        <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold capitalize">
                          {design.space_category.replace('-', ' ')}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {design.material_type ? (
                        <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                          {design.material_type}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {design.price_per_sqft ? (
                        <div>
                          <p className="font-bold text-gray-900 text-lg">₹{design.price_per_sqft}</p>
                          <p className="text-xs text-gray-500">per sq.ft</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(design.id, design.is_active)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                          design.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {design.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/design/${design.id}`}
                          target="_blank"
                          className="p-2 hover:bg-blue-100 rounded-lg transition-all"
                          title="View on Site"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </Link>
                        <Link
                          href={`/admin/products/${design.id}/edit`}
                          className="p-2 hover:bg-green-100 rounded-lg transition-all"
                          title="Edit Design"
                        >
                          <Edit className="w-5 h-5 text-green-600" />
                        </Link>
                        <button
                          onClick={() => deleteDesign(design.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-all"
                          title="Delete Design"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
