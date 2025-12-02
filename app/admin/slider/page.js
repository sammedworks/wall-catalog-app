'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, GripVertical } from 'lucide-react';

export default function SliderManager() {
  const [looks, setLooks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadLooks();
  }, []);

  const loadLooks = () => {
    const saved = localStorage.getItem('looks_config');
    if (saved) {
      setLooks(JSON.parse(saved));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      localStorage.setItem('looks_config', JSON.stringify(looks));
      setMessage('Slider configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving slider:', error);
      setMessage('Error saving slider configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (id) => {
    setLooks(looks.map(look => 
      look.id === id ? { ...look, enabled: !look.enabled } : look
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

  const enabledLooks = looks.filter(l => l.enabled);

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
                <h1 className="text-2xl font-bold text-gray-900">Slider Manager</h1>
                <p className="text-sm text-gray-600">Control Explore-by-View slider</p>
              </div>
            </div>
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
        <div className="mb-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h3 className="font-bold text-orange-900 mb-2">🎚️ Slider Control</h3>
          <p className="text-orange-800 mb-2">
            Control which looks appear in the "Explore by View" horizontal slider on the homepage.
          </p>
          <p className="text-orange-800">
            <strong>{enabledLooks.length}</strong> looks currently enabled and visible in slider.
          </p>
        </div>

        {/* Preview */}
        <div className="mb-8 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Slider Preview</h3>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {enabledLooks.map((look) => (
              <div key={look.id} className="flex-shrink-0 flex flex-col items-center gap-3">
                <div
                  className="w-32 h-32 rounded-full shadow-lg border-4 border-white"
                  style={{ backgroundColor: look.color }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg drop-shadow-lg">
                      {look.name}
                    </span>
                  </div>
                </div>
                <span className="text-base font-semibold text-gray-900">
                  {look.name}
                </span>
              </div>
            ))}
          </div>
          {enabledLooks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No looks enabled. Enable at least one look to show in slider.
            </div>
          )}
        </div>

        {/* Looks List */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Slider Items</h3>
          <div className="space-y-3">
            {looks.map((look, index) => (
              <div
                key={look.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  look.enabled
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {/* Drag Handle */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1 hover:bg-white rounded disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === looks.length - 1}
                    className="p-1 hover:bg-white rounded disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                {/* Order Number */}
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-sm">
                  {index + 1}
                </div>

                {/* Color Preview */}
                <div
                  className="w-12 h-12 rounded-lg border-2 border-white shadow-sm"
                  style={{ backgroundColor: look.color }}
                />

                {/* Look Info */}
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{look.name}</div>
                  <div className="text-sm text-gray-600">ID: {look.id}</div>
                </div>

                {/* Status Badge */}
                <div>
                  {look.enabled ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                      Visible
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm font-semibold rounded-full">
                      Hidden
                    </span>
                  )}
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => handleToggle(look.id)}
                  className={`p-3 rounded-lg transition-all ${
                    look.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  }`}
                  title={look.enabled ? 'Hide from slider' : 'Show in slider'}
                >
                  {look.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>

          {looks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No looks configured. Go to{' '}
              <Link href="/admin/looks" className="text-orange-600 font-semibold hover:underline">
                Looks Manager
              </Link>{' '}
              to add looks.
            </div>
          )}
        </div>

        {/* Save Button (Bottom) */}
        {looks.length > 0 && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Slider Configuration'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
