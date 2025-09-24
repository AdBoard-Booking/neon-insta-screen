'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Instagram, 
  MessageCircle, 
  Globe, 
  Users,
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface Submission {
  id: string;
  name: string;
  instagramHandle?: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  source: 'whatsapp' | 'web';
  createdAt: string;
  approvedAt?: string;
  framedImageUrl?: string;
  phoneNumber?: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
    
    // Refresh every 10 seconds
    const interval = setInterval(fetchSubmissions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions');
      const data = await response.json();
      
      if (data.submissions && data.stats) {
        setSubmissions(data.submissions);
        setStats(data.stats);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setIsLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    setIsProcessing(id);
    
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setSubmissions(prev => 
          prev.map(sub => 
            sub.id === id 
              ? { ...sub, status, approvedAt: status === 'approved' ? new Date().toISOString() : undefined }
              : sub
          )
        );
        
        // Update stats
        setStats(prev => ({
          ...prev,
          [status]: prev[status] + 1,
          pending: prev.pending - 1,
        }));
      }
    } catch (error) {
      console.error('Error updating submission:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    filter === 'all' || sub.status === filter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    return source === 'whatsapp' ? MessageCircle : Globe;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage selfie submissions and billboard content</p>
            </div>
            <button
              onClick={fetchSubmissions}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All', count: stats.total },
                { key: 'pending', label: 'Pending', count: stats.pending },
                { key: 'approved', label: 'Approved', count: stats.approved },
                { key: 'rejected', label: 'Rejected', count: stats.rejected },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instagram
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => {
                  const SourceIcon = getSourceIcon(submission.source);
                  
                  return (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={submission.imageUrl}
                          alt={submission.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.instagramHandle ? (
                          <div className="flex items-center space-x-1">
                            <Instagram className="w-4 h-4 text-pink-500" />
                            <span className="text-sm text-gray-900">
                              @{submission.instagramHandle}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <SourceIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 capitalize">
                            {submission.source}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(submission.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {submission.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateSubmissionStatus(submission.id, 'approved')}
                              disabled={isProcessing === submission.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 disabled:opacity-50"
                            >
                              {isProcessing === submission.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => updateSubmissionStatus(submission.id, 'rejected')}
                              disabled={isProcessing === submission.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          </div>
                        )}
                        {submission.status === 'approved' && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Live on billboard</span>
                          </div>
                        )}
                        {submission.status === 'rejected' && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">Rejected</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No submissions have been received yet.'
                : `No ${filter} submissions found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}