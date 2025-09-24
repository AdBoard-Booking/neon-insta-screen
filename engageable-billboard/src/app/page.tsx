import Link from 'next/link';
import { Camera, Instagram, MessageCircle, Eye, ArrowRight, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              #MyBillboardMoment
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Share your selfie and see it live on our digital billboard! 
              Upload via web or WhatsApp and watch your moment go viral.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/upload"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                <Camera className="w-6 h-6 mr-2" />
                Upload Your Selfie
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                href="/billboard"
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:bg-white/30 transition-colors border border-white/30"
              >
                <Eye className="w-6 h-6 mr-2" />
                View Live Billboard
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">326</div>
                <div className="text-white/80">Selfies Today</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">2.4K</div>
                <div className="text-white/80">Total Uploads</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">15K</div>
                <div className="text-white/80">Instagram Mentions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your selfie on the billboard in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <Camera className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                1. Upload Your Selfie
              </h3>
              <p className="text-gray-600">
                Take a great selfie and upload it via our web form or send it directly through WhatsApp.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-6">
                <Eye className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                2. Get Approved
              </h3>
              <p className="text-gray-600">
                Our team reviews your submission and frames it with our brand overlay for the billboard.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Instagram className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                3. Go Viral
              </h3>
              <p className="text-gray-600">
                Watch your selfie appear on the billboard and share it on Instagram with #MyBillboardMoment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Methods Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Upload Your Selfie
            </h2>
            <p className="text-xl text-gray-600">
              Choose your preferred method to share your moment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link
              href="/upload"
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6 group-hover:bg-purple-200 transition-colors">
                  <Camera className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Web Upload
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload directly through our website with your name and Instagram handle.
                </p>
                <div className="inline-flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                  Upload Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  WhatsApp Upload
                </h3>
                <p className="text-gray-600 mb-6">
                  Send your selfie directly to our WhatsApp number for instant upload.
                </p>
                <div className="text-green-600 font-semibold">
                  +1 (555) 123-4567
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make Your Mark?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of others who have shared their #MyBillboardMoment
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            <Camera className="w-6 h-6 mr-2" />
            Upload Your Selfie Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              #MyBillboardMoment
            </h3>
            <p className="text-gray-400 mb-6">
              Share your selfie and see it live on our digital billboard
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                href="/upload"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Upload
              </Link>
              <Link
                href="/billboard"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Live Billboard
              </Link>
              <Link
                href="/admin"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}