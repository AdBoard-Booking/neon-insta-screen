'use client';

import { useUser } from '@stackframe/stack';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Submission {
  id: string;
  name: string;
  instagramHandle?: string;
  whatsappContact?: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  source: 'whatsapp' | 'web';
  createdAt: string;
  hasAuthenticated?: boolean;
  email?: string;
}

export default function ConfirmPage() {
  const user = useUser({ or: "redirect" });
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const submissionId = params.id as string;

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) {
        setError('Invalid submission ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/submissions/${submissionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Submission not found');
          } else {
            setError('Failed to load submission');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setSubmission(data.submission);
        
        // Check if already authenticated
        if (data.submission.hasAuthenticated) {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
        setError('Failed to load submission');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSubmission();
    }
  }, [submissionId, user]);

  const handleConfirm = async () => {
    if (!user?.primaryEmail || !acceptTerms) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: submissionId,
          email: user.primaryEmail,
          acceptTerms: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsCompleted(true);
        // Update local submission state
        setSubmission(prev => prev ? {
          ...prev,
          hasAuthenticated: true,
          email: user.primaryEmail,
        } : null);
      } else {
        setError(result.error || 'Failed to confirm submission');
      }
    } catch (error) {
      console.error('Error confirming submission:', error);
      setError('Failed to confirm submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Confirmation Complete!
          </h1>
          <p className="text-gray-600 mb-6">
            Your submission has been confirmed and authenticated. Your selfie is now in the review queue!
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Name:</strong> {submission?.name}
            </p>
            {submission?.instagramHandle && (
              <p className="text-sm text-gray-600">
                <strong>Instagram:</strong> @{submission.instagramHandle}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {user?.primaryEmail}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirm Your Submission
          </h1>
          <p className="text-gray-600">
            Please review your submission and accept the terms to complete the process.
          </p>
        </div>

        {submission && (
          <div className="space-y-6">
            {/* Submission Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Your Submission</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {submission.name}
                </p>
                {submission.instagramHandle && (
                  <p className="text-sm text-gray-600">
                    <strong>Instagram:</strong> @{submission.instagramHandle}
                  </p>
                )}
                {submission.whatsappContact && (
                  <p className="text-sm text-gray-600">
                    <strong>WhatsApp:</strong> {submission.whatsappContact}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {submission.status}
                </p>
              </div>
              
              {/* Image Preview */}
              <div className="mt-4">
                <Image
                  src={submission.imageUrl}
                  alt="Your submission"
                  width={200}
                  height={200}
                  className="w-full max-w-xs mx-auto rounded-lg object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* User Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Logged in as</h3>
              <p className="text-sm text-gray-600">
                {user?.primaryEmail}
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-5">
                  I accept the <strong>AdBoard Booking Terms and Conditions</strong>. 
                  I understand that my submission will be reviewed and may be displayed 
                  on the billboard. I consent to the use of my image for promotional purposes 
                  related to this campaign.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConfirm}
              disabled={!acceptTerms || isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Confirming...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Submission
                </div>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center">
          <p className="text-xs text-gray-500 mb-2">Powered by</p>
          <Link href={'https://www.adboardbooking.com'}>
            <Image
              src="https://ik.imagekit.io/teh6pz4rx/adboard-booking-web/AdBoardLogo/logo1.png"
              alt="AdBoard Logo"
              width={120}
              height={60}
              className="mx-auto"
              unoptimized
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
