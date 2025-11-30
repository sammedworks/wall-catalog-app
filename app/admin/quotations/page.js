'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, Download, Mail, Filter } from 'lucide-react';
import Link from 'next/link';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*, quotation_items(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error) {
      console.error('Error loading quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('quotations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setQuotations(quotations.map(q => 
        q.id === id ? { ...q, status: newStatus } : q
      ));
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredQuotations = quotations.filter(q => 
    filterStatus === 'all' || q.status === filterStatus
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600 mt-1">Manage customer quotation requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{quotations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Draft</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">
            {quotations.filter(q => q.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Sent</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {quotations.filter(q => q.status === 'sent').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Accepted</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {quotations.filter(q => q.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {quotations.filter(q => q.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quote #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No quotations found
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{quotation.quotation_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{quotation.customer_name}</p>
                        <p className="text-sm text-gray-500">{quotation.customer_email}</p>
                        <p className="text-sm text-gray-500">{quotation.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{quotation.quotation_items?.[0]?.count || 0} items</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">₹{quotation.final_amount?.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Inc. tax</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={quotation.status}
                        onChange={(e) => updateStatus(quotation.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quotation.status)}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(quotation.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/quotations/${quotation.id}`}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </Link>
                        <button
                          className="p-2 hover:bg-green-100 rounded-lg transition-all"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5 text-green-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-purple-100 rounded-lg transition-all"
                          title="Send Email"
                        >
                          <Mail className="w-5 h-5 text-purple-600" />
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