'use client';

import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AlertTriangle, ArrowLeft, LogOut } from 'lucide-react';

export default function UnauthorizedPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    // If no user is logged in, redirect to sign in
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    try {
      user?.signOut();
      // await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access the admin dashboard. 
          Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-500 mb-1">Logged in as:</p>
            <p className="font-medium text-gray-900">{user.primaryEmail}</p>
            {user.displayName && (
              <p className="text-sm text-gray-600">{user.displayName}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
