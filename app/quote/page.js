'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const WALL_AREAS = [
  'TV Wall',
  'Mandir',
  'Bedroom',
  'Entrance',
  'Study',
  'Living Room',
  'Dining Room',
  'Other'
];

export default function QuotePage() {
  const router = useRouter();
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    wallArea: '',
    selectedDesign: '',
    selectedMaterial: '',
    totalCost: 0
  });

  useEffect(() => {
    // Load quote data from localStorage
    const savedQuote = localStorage.getItem('currentQuote');
    if (savedQuote) {
      const data = JSON.parse(savedQuote);
      setQuoteData(data);
      setFormData({
        ...formData,
        selectedDesign: data.design?.name || '',
        selectedMaterial: data.material?.name || '',
        totalCost: data.cost?.rounded || data.cost?.total || 0
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create quotation in database
      const { data, error } = await supabase
        .from('quotations')
        .insert({
          customer_name: formData.customerName,
          customer_phone: formData.phoneNumber,
          customer_email: '', // Optional
          total_amount: formData.totalCost,
          final_amount: formData.totalCost,
          status: 'draft',
          notes: `Wall Area: ${formData.wallArea}\nDesign: ${formData.selectedDesign}\nMaterial: ${formData.selectedMaterial}`
        })
        .select()
        .single();

      if (error) throw error;

      // Clear saved quote
      localStorage.removeItem('currentQuote');
      
      setSubmitted(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Failed to submit quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quote Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest. Our team will contact you within 24 hours.
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700 mb-1">Your Quote Number:</p>
            <p className="text-2xl font-bold text-green-600">
              QT-{Date.now().toString().slice(-6)}
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-all">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Request Quote</h1>
              <p className="text-xs text-gray-600">Get your personalized quote</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Details</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="John Doe"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="9876543210"
                  />
                  <p className="text-xs text-gray-500 mt-1">10 digits without country code</p>
                </div>

                {/* Wall Area */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wall Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.wallArea}
                    onChange={(e) => setFormData({ ...formData, wallArea: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  >
                    <option value="">Select wall area</option>
                    {WALL_AREAS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                {/* Selected Design (Auto-filled) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selected Design
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.selectedDesign}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-lg text-gray-700"
                    placeholder="No design selected"
                  />
                </div>

                {/* Selected Material (Auto-filled) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selected Material
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.selectedMaterial}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-lg text-gray-700"
                    placeholder="No material selected"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Quote Request'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Summary - Right Column (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white sticky top-24">
              <h3 className="text-xl font-bold mb-6">Quote Summary</h3>

              <div className="space-y-4 mb-6">
                {quoteData?.design && (
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <p className="text-sm text-blue-100 mb-1">Design</p>
                    <p className="font-semibold">{quoteData.design.name}</p>
                  </div>
                )}

                {quoteData?.material && (
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <p className="text-sm text-blue-100 mb-1">Material</p>
                    <p className="font-semibold">{quoteData.material.name}</p>
                  </div>
                )}

                {quoteData?.area && (
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <p className="text-sm text-blue-100 mb-1">Area</p>
                    <p className="font-semibold">{quoteData.area} sq.ft</p>
                  </div>
                )}

                {quoteData?.addons && quoteData.addons.length > 0 && (
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <p className="text-sm text-blue-100 mb-2">Add-ons</p>
                    {quoteData.addons.map((addon) => (
                      <p key={addon.id} className="text-sm font-medium">
                        • {addon.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-white border-opacity-30 pt-6">
                <p className="text-sm text-blue-100 mb-2">Total Cost</p>
                <p className="text-5xl font-bold mb-2">
                  ₹{formData.totalCost.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-blue-100">
                  Including installation & materials
                </p>
              </div>

              {!quoteData && (
                <div className="mt-6 bg-yellow-500 bg-opacity-20 rounded-xl p-4 border border-yellow-300 border-opacity-30">
                  <p className="text-sm text-yellow-100">
                    💡 Tip: Select a design first to auto-fill details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">What happens next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">We Review</p>
                <p className="text-sm text-gray-600">Our team reviews your requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">We Call</p>
                <p className="text-sm text-gray-600">We'll call you within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">We Install</p>
                <p className="text-sm text-gray-600">Professional installation in 2-3 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}