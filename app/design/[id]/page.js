'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Tag, DollarSign, Lightbulb, Home } from 'lucide-react';

export default function DesignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadDesign();
    }
  }, [params.id]);

  const loadDesign = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setDesign(data);
    } catch (error) {
      console.error('Error loading design:', error);
      setDesign(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading design...</p>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Design not found</h2>
          <p className="text-gray-600 mb-6">This design may have been removed</p>
          <Link
            href="/designs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Designs
          </Link>
        </div>
      </div>
    );
  }

  const images = [design.image_url, design.image_url_2].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              WALL CATALOG
            </Link>
            <Link 
              href="/quote" 
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all"
            >
              Get Quote
            </Link>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
              <img
                src={images[currentImage]}
                alt={design.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=' + encodeURIComponent(design.name);
                }}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`aspect-[4/3] rounded-xl overflow-hidden shadow-lg transition-all ${
                      currentImage === idx
                        ? 'ring-4 ring-blue-600 scale-105'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${design.name} - Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {design.name}
              </h1>
              {design.description && (
                <p className="text-lg text-gray-600 leading-relaxed">
                  {design.description}
                </p>
              )}
            </div>

            {/* Price */}
            {design.price_per_sqft && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">Pricing</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-blue-900">
                    ₹{design.price_per_sqft}
                  </span>
                  <span className="text-lg text-blue-700">per sq.ft</span>
                </div>
              </div>
            )}

            {/* Specifications */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Specifications</h3>

              {design.material_type && (
                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                  <Tag className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Material / Look</p>
                    <p className="text-lg font-bold text-gray-900">{design.material_type}</p>
                  </div>
                </div>
              )}

              {design.style_category && (
                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                  <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Budget Category</p>
                    <p className="text-lg font-bold text-gray-900">{design.style_category}</p>
                  </div>
                </div>
              )}

              {design.lighting_type && (
                <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                  <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Lighting Type</p>
                    <p className="text-lg font-bold text-gray-900">{design.lighting_type}</p>
                  </div>
                </div>
              )}

              {design.space_category && (
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Best For</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">
                      {design.space_category.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link
                href="/quote"
                className="block w-full py-4 bg-gray-900 text-white text-center rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg"
              >
                Get Quote for This Design
              </Link>
              <Link
                href="/designs"
                className="block w-full py-4 bg-white text-gray-900 text-center rounded-xl font-bold text-lg hover:bg-gray-50 transition-all border-2 border-gray-300"
              >
                Browse More Designs
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
