'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Tag } from 'lucide-react';

const TAG_CATEGORIES = ['style', 'material', 'price', 'feature', 'room', 'other'];

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'style',
    display_order: 0
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('design_tags')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('design_tags')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        alert('Tag updated successfully!');
      } else {
        const { error } = await supabase
          .from('design_tags')
          .insert([formData]);

        if (error) throw error;
        alert('Tag created successfully!');
      }

      resetForm();
      loadTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Failed to save tag: ' + error.message);
    }
  };

  const handleEdit = (tag) => {
    setFormData({
      name: tag.name,
      category: tag.category || 'style',
      display_order: tag.display_order
    });
    setEditingId(tag.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const { error} = await supabase
        .from('design_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Tag deleted successfully!');
      loadTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Failed to delete tag: ' + error.message);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('design_tags')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadTags();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'style',
      display_order: 0
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const groupedTags = tags.reduce((acc, tag) => {
    const category = tag.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(tag);
    return acc;
  }, {});

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Design Tags</h1>
          <p className="text-gray-600 mt-1">Manage tags for design filtering and categorization</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Tag
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? 'Edit Tag' : 'Add New Tag'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Modern, Luxury"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TAG_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
              <div className="inline-flex px-5 py-2.5 rounded-full text-sm font-medium bg-gray-900 text-white">
                {formData.name || 'Tag Name'}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Update' : 'Create'} Tag
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tags List - Grouped by Category */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
            Loading tags...
          </div>
        ) : Object.keys(groupedTags).length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
            No tags found. Add your first tag!
          </div>
        ) : (
          Object.entries(groupedTags).map(([category, categoryTags]) => (
            <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {category} Tags ({categoryTags.length})
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tag Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categoryTags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="inline-flex px-4 py-2 rounded-full text-sm font-medium bg-gray-900 text-white">
                            {tag.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tag.display_order}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleActive(tag.id, tag.is_active)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              tag.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {tag.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(tag)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(tag.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
