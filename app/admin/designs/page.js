'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  Upload,
  X,
  Save
} from 'lucide-react';

const SPACES = [
  { id: 'tv-unit', name: 'TV Unit Wall' },
  { id: 'living-room', name: 'Living Room Wall' },
  { id: 'bedroom', name: 'Bedroom Wall' },
  { id: 'entrance', name: 'Entrance Wall' },
  { id: 'study', name: 'Study Wall' },
  { id: 'mandir', name: 'Mandir Wall' },
];

const LOOKS = [
  'Wood', 'Marble', 'Rattan', 'Fabric', 'Limewash', 'Pastel', 'Stone', 'Gold', 'Traditional'
];

const BUDGETS = ['Economy', 'Minimal', 'Luxe', 'Statement'];

const LIGHTING = ['Cove Light', 'Profile Light', 'Wall Washer Light'];

export default function DesignsLibrary() {
  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    image_url_2: '',
    space_category: '',
    material_type: '',
    style_category: '',
    lighting_type: '',
    price_per_sqft: '',
    is_active: true
  });

  useEffect(() => {
    loadDesigns();
  }, []);

  useEffect(() => {
    filterDesigns();
  }, [designs, searchQuery]);

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

  const filterDesigns = () => {
    if (!searchQuery) {
      setFilteredDesigns(designs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = designs.filter(design =>
      design.name?.toLowerCase().includes(query) ||
      design.description?.toLowerCase().includes(query) ||
      design.material_type?.toLowerCase().includes(query) ||
      design.space_category?.toLowerCase().includes(query)
    );
    setFilteredDesigns(filtered);
  };

  const handleOpenModal = (design = null) => {
    if (design) {
      setEditingDesign(design);
      setFormData(design);
    } else {
      setEditingDesign(null);
      setFormData({
        name: '',
        description: '',
        image_url: '',
        image_url_2: '',
        space_category: '',
        material_type: '',
        style_category: '',
        lighting_type: '',
        price_per_sqft: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDesign(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDesign) {
        // Update existing design
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingDesign.id);

        if (error) throw error;
      } else {
        // Create new design
        const { error } = await supabase
          .from('products')
          .insert([formData]);

        if (error) throw error;
      }

      await loadDesigns();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Error saving design: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadDesigns();
    } catch (error) {
      console.error('Error deleting design:', error);
      alert('Error deleting design: ' + error.message);
    }
  };

  const handleToggleActive = async (design) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !design.is_active })
        .eq('id', design.id);

      if (error) throw error;
      await loadDesigns();
    } catch (error) {
      console.error('Error toggling design:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Designs Library</h1>
                <p className="text-sm text-gray-600">{designs.length} total designs</p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Upload Design
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search designs by name, material, space..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Designs Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading designs...</p>
            </div>
          </div>
        ) : filteredDesigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design) => (
              <div
                key={design.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden ${
                  !design.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={design.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={design.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  {!design.is_active && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold">INACTIVE</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {design.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {design.description || 'No description'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {design.space_category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {SPACES.find(s => s.id === design.space_category)?.name || design.space_category}
                      </span>
                    )}
                    {design.material_type && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        {design.material_type}
                      </span>
                    )}
                    {design.style_category && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        {design.style_category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{design.price_per_sqft || 0}/sq.ft
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(design)}
                        className={`p-2 rounded-lg transition-all ${
                          design.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title={design.is_active ? 'Active' : 'Inactive'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(design)}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(design.id)}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'No designs found' : 'No designs yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try a different search term' : 'Upload your first design to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                <Plus className="w-5 h-5" />
                Upload Design
              </button>
            )}
          </div>
        )}
      </main>

      {/* Upload/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-xl font-bold">
                {editingDesign ? 'Edit Design' : 'Upload New Design'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Design Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Dark Oak Panel"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe the design..."
                  />
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Secondary Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url_2}
                    onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Space *
                  </label>
                  <select
                    required
                    value={formData.space_category}
                    onChange={(e) => setFormData({ ...formData, space_category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select space</option>
                    {SPACES.map(space => (
                      <option key={space.id} value={space.id}>{space.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Look / Material *
                  </label>
                  <select
                    required
                    value={formData.material_type}
                    onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select look</option>
                    {LOOKS.map(look => (
                      <option key={look} value={look}>{look}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget *
                  </label>
                  <select
                    required
                    value={formData.style_category}
                    onChange={(e) => setFormData({ ...formData, style_category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select budget</option>
                    {BUDGETS.map(budget => (
                      <option key={budget} value={budget}>{budget}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lighting Type
                  </label>
                  <select
                    value={formData.lighting_type}
                    onChange={(e) => setFormData({ ...formData, lighting_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select lighting</option>
                    {LIGHTING.map(light => (
                      <option key={light} value={light}>{light}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price per sq.ft *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price_per_sqft}
                    onChange={(e) => setFormData({ ...formData, price_per_sqft: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="500"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Active (visible on site)</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingDesign ? 'Update Design' : 'Upload Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
