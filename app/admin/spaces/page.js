'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Save, Upload, Eye } from 'lucide-react';

const FIXED_SPACES = [
  {
    id: 'tv-unit',
    name: 'TV Unit Wall',
    description: 'Transform your entertainment space with stunning wall designs',
    defaultImages: [
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=600&fit=crop',
    ]
  },
  {
    id: 'living-room',
    name: 'Living Room Wall',
    description: 'Create an inviting atmosphere with elegant wall treatments',
    defaultImages: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=600&fit=crop',
    ]
  },
  {
    id: 'bedroom',
    name: 'Bedroom Wall',
    description: 'Design a peaceful retreat with beautiful wall finishes',
    defaultImages: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=1200&h=600&fit=crop',
    ]
  },
  {
    id: 'entrance',
    name: 'Entrance Wall',
    description: 'Make a lasting first impression with striking entrance walls',
    defaultImages: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=600&fit=crop',
    ]
  },
  {
    id: 'study',
    name: 'Study Wall',
    description: 'Enhance productivity with inspiring wall designs',
    defaultImages: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=600&fit=crop',
    ]
  },
  {
    id: 'mandir',
    name: 'Mandir Wall',
    description: 'Create a sacred space with traditional and modern designs',
    defaultImages: [
      'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&h=600&fit=crop',
    ]
  },
];

export default function SpacesManager() {
  const [spaces, setSpaces] = useState(FIXED_SPACES);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageChange = (spaceId, imageIndex, newUrl) => {
    setSpaces(prev => prev.map(space => {
      if (space.id === spaceId) {
        const newImages = [...space.defaultImages];
        newImages[imageIndex] = newUrl;
        return { ...space, defaultImages: newImages };
      }
      return space;
    }));
  };

  const handleDescriptionChange = (spaceId, newDescription) => {
    setSpaces(prev => prev.map(space => {
      if (space.id === spaceId) {
        return { ...space, description: newDescription };
      }
      return space;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Save to localStorage or database
      localStorage.setItem('spaces_config', JSON.stringify(spaces));
      
      setMessage('Spaces configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving spaces:', error);
      setMessage('Error saving spaces configuration');
    } finally {
      setSaving(false);
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
                <h1 className="text-2xl font-bold text-gray-900">Spaces Manager</h1>
                <p className="text-sm text-gray-600">Manage 6 fixed spaces</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Info Box */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">📌 Fixed Spaces</h3>
          <p className="text-blue-800">
            These 6 spaces are fixed and cannot be added or removed. You can customize their descriptions and slideshow images.
          </p>
        </div>

        {/* Spaces Grid */}
        <div className="space-y-8">
          {spaces.map((space) => (
            <div key={space.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{space.name}</h3>
                    <p className="text-sm text-gray-600">ID: {space.id}</p>
                  </div>
                  <Link
                    href={`/space/${space.id}`}
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={space.description}
                    onChange={(e) => handleDescriptionChange(space.id, e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter space description..."
                  />
                </div>

                {/* Slideshow Images */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Slideshow Images (3 images)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {space.defaultImages.map((imageUrl, index) => (
                      <div key={index} className="space-y-2">
                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`${space.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/600x400?text=Image+' + (index + 1);
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold">
                            {index + 1}/3
                          </div>
                        </div>
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => handleImageChange(space.id, index, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Image URL"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button (Bottom) */}
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
      </main>
    </div>
  );
}
