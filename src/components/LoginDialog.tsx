'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SignIn } from '@stackframe/stack';
import { LogIn } from 'lucide-react';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            Login Required
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Please log in to submit your photo to the billboard
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-600">
              Please sign in to submit your photo to the billboard
            </p>
          </div>

          <SignIn 
            fullPage={false}
            extraInfo={
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our terms of service and privacy policy
                </p>
              </div>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
