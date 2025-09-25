'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  Instagram,
  MessageCircle,
  Globe,
  Users,
  Clock,
  RefreshCw,
  Trash2,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
          disableAutoSelect?: () => void;
        };
      };
    };
    posthog?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify?: (distinctId: string, properties?: Record<string, unknown>) => void;
    };
  }
}

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

interface AdminSession {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
}

const initialStats: Stats = { total: 0, pending: 0, approved: 0, rejected: 0 };

const capturePosthogEvent = (event: string, properties?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !window.posthog) {
    return;
  }

  try {
    window.posthog.capture(event, properties);
  } catch (error) {
    console.error('Failed to capture PostHog event', error);
  }
};

export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [notification]);

  const identifyUserWithPosthog = useCallback((activeSession: AdminSession | null) => {
    if (!activeSession || typeof window === 'undefined' || !window.posthog) {
      return;
    }

    try {
      window.posthog.identify?.(activeSession.email, {
        email: activeSession.email,
        name: activeSession.name,
      });
    } catch (error) {
      console.error('Failed to identify user in PostHog', error);
    }
  }, []);

  const handleUnauthorized = useCallback(() => {
    setSession(null);
    setAuthError('Your session has expired. Please sign in again.');
    setAuthLoading(false);
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      setAuthLoading(true);
      const response = await fetch('/api/auth/session', { cache: 'no-store' });

      if (!response.ok) {
        setSession(null);
        return;
      }

      const data = await response.json();
      setSession(data.session as AdminSession);
      setAuthError(null);
    } catch (error) {
      console.error('Failed to load admin session', error);
      setSession(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    identifyUserWithPosthog(session);
  }, [session, identifyUserWithPosthog]);

  const fetchSubmissions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/submissions', { cache: 'no-store' });

      if (response.status === 401) {
        handleUnauthorized();
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (data.submissions && data.stats) {
        setSubmissions(data.submissions as Submission[]);
        setStats(data.stats as Stats);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      capturePosthogEvent('admin_fetch_submissions_failed', {
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    if (!session) {
      setSubmissions([]);
      setStats(initialStats);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchSubmissions();

    const interval = setInterval(() => {
      fetchSubmissions();
    }, 10000);

    return () => clearInterval(interval);
  }, [session, fetchSubmissions]);

  const initializeGoogleSignIn = useCallback(() => {
    if (!googleButtonRef.current) {
      return;
    }

    if (!googleClientId) {
      setAuthError('Google client ID is not configured.');
      return;
    }

    if (!window.google || !window.google.accounts?.id) {
      setAuthError('Unable to load Google sign-in. Please try again.');
      return;
    }

    if (googleButtonRef.current.childElementCount === 0) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          if (!credential) {
            setAuthError('No Google credential was returned.');
            return;
          }

          setIsSigningIn(true);
          setAuthError(null);
          capturePosthogEvent('admin_login_attempt', { provider: 'google' });

          try {
            const response = await fetch('/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ credential }),
            });

            const data = await response.json();

            if (!response.ok) {
              const message = data.error ?? 'Failed to sign in with Google.';
              setAuthError(message);
              capturePosthogEvent('admin_login_failure', { reason: message });
              return;
            }

            setSession(data.session as AdminSession);
            setAuthError(null);
            capturePosthogEvent('admin_login_success', { email: data.session?.email });
          } catch (error) {
            console.error('Failed to sign in with Google', error);
            setAuthError('An unexpected error occurred during sign-in.');
            capturePosthogEvent('admin_login_failure', { reason: 'network_error' });
          } finally {
            setIsSigningIn(false);
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        width: 320,
      });
    }

    window.google.accounts.id.prompt();
  }, [googleClientId]);

  useEffect(() => {
    if (authLoading || session) {
      return;
    }

    if (window.google && window.google.accounts?.id) {
      initializeGoogleSignIn();
      return;
    }

    const existingScript = document.getElementById('google-identity-services') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogleSignIn);
      return () => existingScript.removeEventListener('load', initializeGoogleSignIn);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-identity-services';
    script.onload = initializeGoogleSignIn;
    script.onerror = () => {
      setAuthError('Failed to load Google sign-in. Please check your network connection.');
    };

    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [session, authLoading, initializeGoogleSignIn]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      capturePosthogEvent('admin_logout', { email: session?.email });
    } catch (error) {
      console.error('Failed to log out', error);
    } finally {
      window.google?.accounts?.id?.disableAutoSelect?.();
      setSession(null);
      setSubmissions([]);
      setStats(initialStats);
    }
  };

  const handleManualRefresh = () => {
    if (!session) {
      return;
    }
    setIsLoading(true);
    capturePosthogEvent('admin_manual_refresh');
    fetchSubmissions();
  };

  const updateSubmissionStatus = async (id: string, status: 'approved' | 'rejected') => {
    setIsProcessing(id);
    const currentSubmission = submissions.find(sub => sub.id === id);
    capturePosthogEvent('admin_update_submission_attempt', {
      submissionId: id,
      newStatus: status,
      previousStatus: currentSubmission?.status,
    });

    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (result.success) {
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === id
              ? {
                  ...sub,
                  status,
                  approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
                  framedImageUrl: result.framedImageUrl ?? sub.framedImageUrl,
                }
              : sub,
          ),
        );

        setStats(prev => {
          const nextStats = { ...prev };
          if (currentSubmission?.status && currentSubmission.status !== status) {
            nextStats[currentSubmission.status] = Math.max(0, nextStats[currentSubmission.status] - 1);
          }
          nextStats[status] = nextStats[status] + 1;
          return nextStats;
        });

        setNotification({
          type: 'success',
          message: `Submission ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
        });

        capturePosthogEvent('admin_update_submission_success', {
          submissionId: id,
          newStatus: status,
        });
      } else {
        const message = result.error ?? 'Failed to update submission.';
        setNotification({ type: 'error', message });
        capturePosthogEvent('admin_update_submission_failed', {
          submissionId: id,
          newStatus: status,
          reason: message,
        });
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      const message = 'An unexpected error occurred while updating the submission.';
      setNotification({ type: 'error', message });
      capturePosthogEvent('admin_update_submission_failed', {
        submissionId: id,
        newStatus: status,
        reason: error instanceof Error ? error.message : 'unknown_error',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const deleteSubmission = async (id: string) => {
    setIsProcessing(id);
    const submissionToDelete = submissions.find(sub => sub.id === id);
    capturePosthogEvent('admin_delete_submission_attempt', { submissionId: id });

    try {
      const response = await fetch(`/api/admin/submissions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (result.success) {
        setSubmissions(prev => prev.filter(sub => sub.id !== id));

        setStats(prev => {
          const nextStats = { ...prev, total: Math.max(0, prev.total - 1) };
          if (submissionToDelete) {
            nextStats[submissionToDelete.status] = Math.max(
              0,
              nextStats[submissionToDelete.status] - 1,
            );
          }
          return nextStats;
        });

        setShowDeleteConfirm(null);
        setNotification({ type: 'success', message: 'Submission deleted successfully.' });
        capturePosthogEvent('admin_delete_submission_success', { submissionId: id });
      } else {
        const message = result.error ?? 'Failed to delete submission.';
        setNotification({ type: 'error', message });
        capturePosthogEvent('admin_delete_submission_failed', {
          submissionId: id,
          reason: message,
        });
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      const message = 'An unexpected error occurred while deleting the submission.';
      setNotification({ type: 'error', message });
      capturePosthogEvent('admin_delete_submission_failed', {
        submissionId: id,
        reason: error instanceof Error ? error.message : 'unknown_error',
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredSubmissions = submissions.filter(sub => filter === 'all' || sub.status === filter);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => (source === 'whatsapp' ? MessageCircle : Globe);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Access</h1>
            <p className="text-gray-600 mt-2">
              Sign in with your authorized Google account to manage submissions.
            </p>
          </div>

          {authError && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {authError}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            {googleClientId ? (
              <div ref={googleButtonRef} className="flex justify-center" />
            ) : (
              <div className="text-sm text-red-600">
                Google Sign-In is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable admin login.
              </div>
            )}
          </div>

          {isSigningIn && (
            <p className="mt-4 text-sm text-gray-500 text-center">Signing you in...</p>
          )}

          <p className="mt-6 text-xs text-gray-400 text-center">
            Only pre-approved email addresses can access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
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
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage selfie submissions and billboard content</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-sm text-gray-600 text-left sm:text-right">
                <p className="font-medium text-gray-900">{session.name ?? session.email}</p>
                <p>{session.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualRefresh}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`rounded-lg px-4 py-3 border ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Submissions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-amber-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-rose-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Submissions', count: stats.total },
            { id: 'pending', label: 'Pending', count: stats.pending },
            { id: 'approved', label: 'Approved', count: stats.approved },
            { id: 'rejected', label: 'Rejected', count: stats.rejected },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id as typeof filter);
                capturePosthogEvent('admin_filter_changed', { filter: tab.id });
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs text-gray-600">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission: Submission) => {
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
                        <div className="flex items-center space-x-2">
                          {submission.status === 'approved' && (
                            <div className="flex items-center space-x-1 text-green-600 mr-2">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">Live on billboard</span>
                            </div>
                          )}
                          
                          {submission.status === 'rejected' && (
                            <div className="flex items-center space-x-1 text-red-600 mr-2">
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm">Rejected</span>
                            </div>
                          )}

                          {/* Approve button for non-approved submissions */}
                          {submission.status !== 'approved' && (
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
                          )}

                          {/* Reject button for non-rejected submissions */}
                          {submission.status !== 'rejected' && (
                            <button
                              onClick={() => setShowRejectConfirm(submission.id)}
                              disabled={isProcessing === submission.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200 disabled:opacity-50"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          )}

                          {/* Delete button for all submissions */}
                          <button
                            onClick={() => setShowDeleteConfirm(submission.id)}
                            disabled={isProcessing === submission.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-900">Reject Submission</h3>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Are you sure you want to reject this submission? A rejection notification will be sent to the participant if a phone number is available.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showRejectConfirm) {
                    updateSubmissionStatus(showRejectConfirm, 'rejected');
                    setShowRejectConfirm(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Submission</h3>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              This action will permanently remove the submission from the system. Are you sure you want to continue?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm) {
                    deleteSubmission(showDeleteConfirm);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
