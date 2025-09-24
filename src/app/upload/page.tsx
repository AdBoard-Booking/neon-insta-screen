'use client';

import { useState } from 'react';
import { Upload, Camera, Instagram, User, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const [formData, setFormData] = useState({
    name: '',
    instagramHandle: '',
    image: null as File | null,
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.image || !formData.consent) {
      alert('Please fill in all required fields and accept the terms.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('instagramHandle', formData.instagramHandle);
      submitData.append('image', formData.image);
      submitData.append('source', 'web');
      submitData.append('consent', formData.consent.toString());

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          instagramHandle: '',
          image: null,
          consent: false,
        });
        // Reset file input
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Share Your Selfie
          </h1>
          <p className="text-gray-600">
            Upload your selfie and see it on our billboard!
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">
              Your selfie has been submitted! We'll review it soon.
            </span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-700">
              Something went wrong. Please try again.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Handle (Optional)
            </label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="instagramHandle"
                name="instagramHandle"
                value={formData.instagramHandle}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="@yourusername"
              />
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Your Selfie *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
              <label htmlFor="image" className="cursor-pointer">
                {formData.image ? (
                  <div className="space-y-2">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-gray-600">{formData.image.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={formData.consent}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="consent" className="ml-2 text-sm text-gray-700">
              I consent to my selfie being displayed on the billboard and used for promotional purposes. *
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Uploading...' : 'Upload Selfie'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Or send your selfie via WhatsApp to{' '}
            <span className="font-medium text-purple-600">+1 (555) 123-4567</span>
          </p>
        </div>
      </div>
    </div>
  );
}