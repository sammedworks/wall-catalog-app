'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'material',
    color_code: '#3B82F6',
    description: ''
  });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

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
      if (editingTag) {
        // Update existing tag
        const { error } = await supabase
          .from('tags')
          .update(formData)
          .eq('id', editingTag.id);

        if (error) throw error;
        alert('Tag updated successfully!');
      } else {
        // Create new tag
        const { error } = await supabase
          .from('tags')
          .insert(formData);

        if (error) throw error;
        alert('Tag created successfully!');
      }

      setShowModal(false);
      setEditingTag(null);
      setFormData({
        name: '',
        slug: '',
        category: 'material',
        color_code: '#3B82F6',
        description: ''
      });
      loadTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Failed to save tag: ' + error.message);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      category: tag.category,
      color_code: tag.color_code || '#3B82F6',
      description: tag.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTags(tags.filter(t => t.id !== id));
      alert('Tag deleted successfully!');
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Failed to delete tag');
    }
  };

  const groupedTags = tags.reduce((acc, tag) => {
    const category = tag.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(tag);
    return acc;
  }, {});

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
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600 mt-1">Manage product tags and categories</p>
        </div>
        <button
          onClick={() => {
            setEditingTag(null);
            setFormData({
              name: '',
              slug: '',
              category: 'material',
              color_code: '#3B82F6',
              description: ''
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Tag
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Total Tags</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{tags.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Material Tags</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {tags.filter(t => t.category === 'material').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Style Tags</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {tags.filter(t => t.category === 'style').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Feature Tags</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {tags.filter(t => t.category === 'feature').length}
          </p>
        </div>
      </div>

      {/* Tags by Category */}
      <div className="space-y-6">
        {Object.entries(groupedTags).map(([category, categoryTags]) => (
          <div key={category} className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">
              {category} Tags ({categoryTags.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: tag.color_code + '20' }}
                    >
                      <Tag className="w-5 h-5" style={{ color: tag.color_code }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{tag.name}</p>
                      <p className="text-xs text-gray-500">{tag.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(tag)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTag ? 'Edit Tag' : 'Add New Tag'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tag Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/\s+/g, '-');
                    setFormData({ ...formData, name, slug });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Modern"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="modern"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="material">Material</option>
                  <option value="style">Style</option>
                  <option value="color">Color</option>
                  <option value="feature">Feature</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color Code
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color_code}
                    onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                    className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color_code}
                    onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tag description..."
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
                >
                  {editingTag ? 'Update Tag' : 'Create Tag'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTag(null);
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}