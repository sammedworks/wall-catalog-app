'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';

const DEFAULT_LOOKS = [
  { id: 'wood', name: 'Wood', color: '#8B4513', enabled: true, order: 1 },
  { id: 'marble', name: 'Marble', color: '#F5F5F5', enabled: true, order: 2 },
  { id: 'rattan', name: 'Rattan', color: '#D2B48C', enabled: true, order: 3 },
  { id: 'fabric', name: 'Fabric', color: '#E6E6FA', enabled: true, order: 4 },
  { id: 'limewash', name: 'Limewash', color: '#F0EAD6', enabled: true, order: 5 },
  { id: 'pastel', name: 'Pastel', color: '#FFB6C1', enabled: true, order: 6 },
  { id: 'stone', name: 'Stone', color: '#808080', enabled: true, order: 7 },
  { id: 'gold', name: 'Gold', color: '#FFD700', enabled: true, order: 8 },
  { id: 'traditional', name: 'Traditional', color: '#8B0000', enabled: true, order: 9 },
];

export default function LooksManager() {
  const [looks, setLooks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadLooks();
  }, []);

  const loadLooks = () => {
    const saved = localStorage.getItem('looks_config');
    if (saved) {
      setLooks(JSON.parse(saved));
    } else {
      setLooks(DEFAULT_LOOKS);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      localStorage.setItem('looks_config', JSON.stringify(looks));
      setMessage('Looks configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving looks:', error);
      setMessage('Error saving looks configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    const newLook = {
      id: `look-${Date.now()}`,
      name: 'New Look',
      color: '#000000',
      enabled: true,
      order: looks.length + 1
    };
    setLooks([...looks, newLook]);
    setEditingId(newLook.id);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this look?')) {
      setLooks(looks.filter(look => look.id !== id));
    }
  };

  const handleToggle = (id) => {
    setLooks(looks.map(look => 
      look.id === id ? { ...look, enabled: !look.enabled } : look
    ));
  };

  const handleUpdate = (id, field, value) => {
    setLooks(looks.map(look => 
      look.id === id ? { ...look, [field]: value } : look
    ));
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newLooks = [...looks];
    [newLooks[index - 1], newLooks[index]] = [newLooks[index], newLooks[index - 1]];
    newLooks.forEach((look, idx) => look.order = idx + 1);
    setLooks(newLooks);
  };

  const moveDown = (index) => {
    if (index === looks.length - 1) return;
    const newLooks = [...looks];
    [newLooks[index], newLooks[index + 1]] = [newLooks[index + 1], newLooks[index]];
    newLooks.forEach((look, idx) => look.order = idx + 1);
    setLooks(newLooks);
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
                <h1 className="text-2xl font-bold text-gray-900">Looks Manager</h1>
                <p className="text-sm text-gray-600">Add/edit material categories</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Look
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Info Box */}
        <div className="mb-8 bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-bold text-purple-900 mb-2">🎨 Material Categories</h3>
          <p className="text-purple-800">
            These looks appear in the "Explore by View" slider on the homepage. You can add, edit, reorder, or disable them.
          </p>
        </div>

        {/* Looks List */}
        <div className="space-y-4">
          {looks.map((look, index) => (
            <div
              key={look.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${
                look.enabled ? 'border-transparent' : 'border-gray-300 opacity-60'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  {/* Order Controls */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <span className="text-sm font-bold text-gray-600 text-center">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === looks.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Color Preview */}
                  <div className="flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm"
                      style={{ backgroundColor: look.color }}
                    />
                  </div>

                  {/* Look Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={look.name}
                        onChange={(e) => handleUpdate(look.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        ID (slug)
                      </label>
                      <input
                        type="text"
                        value={look.id}
                        onChange={(e) => handleUpdate(look.id, 'id', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={look.color}
                          onChange={(e) => handleUpdate(look.id, 'color', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={look.color}
                          onChange={(e) => handleUpdate(look.id, 'color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleToggle(look.id)}
                      className={`p-2 rounded-lg transition-all ${
                        look.enabled
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={look.enabled ? 'Enabled' : 'Disabled'}
                    >
                      {look.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(look.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {looks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No looks yet</h3>
            <p className="text-gray-600 mb-6">Add your first material category</p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              <Plus className="w-5 h-5" />
              Add Look
            </button>
          </div>
        )}

        {/* Save Button (Bottom) */}
        {looks.length > 0 && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
