'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, Trash2, Filter, CheckCircle } from 'lucide-react';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnquiries(data || []);
    } catch (error) {
      console.error('Error loading enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setEnquiries(enquiries.map(e => 
        e.id === id ? { ...e, status: newStatus } : e
      ));
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const deleteEnquiry = async (id) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;

    try {
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEnquiries(enquiries.filter(e => e.id !== id));
      alert('Enquiry deleted successfully!');
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      alert('Failed to delete enquiry');
    }
  };

  const filteredEnquiries = enquiries.filter(e => 
    filterStatus === 'all' || e.status === filterStatus
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
          <p className="text-gray-600 mt-1">Manage customer enquiries and messages</p>
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
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Total</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{enquiries.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">New</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {enquiries.filter(e => e.status === 'new').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {enquiries.filter(e => e.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Resolved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {enquiries.filter(e => e.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEnquiries.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No enquiries found</p>
          </div>
        ) : (
          filteredEnquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{enquiry.customer_name}</h3>
                  <p className="text-sm text-gray-600">{enquiry.customer_email}</p>
                  <p className="text-sm text-gray-600">{enquiry.customer_phone}</p>
                </div>
                <select
                  value={enquiry.status}
                  onChange={(e) => updateStatus(enquiry.id, e.target.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enquiry.status)}`}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Subject */}
              {enquiry.subject && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700">Subject:</p>
                  <p className="text-gray-900">{enquiry.subject}</p>
                </div>
              )}

              {/* Message */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Message:</p>
                <p className="text-gray-900 text-sm line-clamp-3">{enquiry.message}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {new Date(enquiry.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEnquiry(enquiry)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-all"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => updateStatus(enquiry.id, 'resolved')}
                    className="p-2 hover:bg-green-100 rounded-lg transition-all"
                    title="Mark Resolved"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </button>
                  <button
                    onClick={() => deleteEnquiry(enquiry.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedEnquiry.customer_name}</h2>
                <p className="text-gray-600">{selectedEnquiry.customer_email}</p>
                <p className="text-gray-600">{selectedEnquiry.customer_phone}</p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {selectedEnquiry.subject && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Subject:</p>
                <p className="text-gray-900 text-lg">{selectedEnquiry.subject}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Message:</p>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedEnquiry.message}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Status:</p>
              <select
                value={selectedEnquiry.status}
                onChange={(e) => {
                  updateStatus(selectedEnquiry.id, e.target.value);
                  setSelectedEnquiry({ ...selectedEnquiry, status: e.target.value });
                }}
                className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(selectedEnquiry.status)}`}
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              Received: {new Date(selectedEnquiry.created_at).toLocaleString('en-IN')}
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  updateStatus(selectedEnquiry.id, 'resolved');
                  setSelectedEnquiry(null);
                }}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}