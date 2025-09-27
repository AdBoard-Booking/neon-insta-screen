import Link from 'next/link';
import { Camera, Instagram, MessageCircle, Eye, ArrowRight, MapPin, Star, Users, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Location Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full border border-blue-500 mb-8">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Gurgaon, Haryana</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              India&apos;s First
              <span className="block text-blue-500">Public Billboard</span>
              <span className="block text-4xl md:text-5xl text-gray-300 mt-2">for Selfies</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Experience the thrill of seeing your selfie on a massive digital billboard in the heart of Gurgaon. 
              Upload your photo and watch it go live for everyone to see!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/upload"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Camera className="w-6 h-6 mr-2" />
                Upload Your Selfie
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                href="/billboard"
                className="inline-flex items-center px-8 py-4 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-100 transition-all duration-300 border border-gray-300"
              >
                <Eye className="w-6 h-6 mr-2" />
                View Live Billboard
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center bg-white rounded-lg p-6 border border-gray-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">1,247</div>
                <div className="text-gray-600">Selfies Today</div>
              </div>
              <div className="text-center bg-white rounded-lg p-6 border border-gray-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">15.2K</div>
                <div className="text-gray-600">Total Uploads</div>
              </div>
              <div className="text-center bg-white rounded-lg p-6 border border-gray-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">89K</div>
                <div className="text-gray-600">Instagram Mentions</div>
              </div>
              <div className="text-center bg-white rounded-lg p-6 border border-gray-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Live Display</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get your selfie on Gurgaon&apos;s most talked-about billboard in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <Camera className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                1. Upload Your Selfie
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Take a great selfie and upload it via our web form or send it directly through WhatsApp. 
                Make sure it&apos;s clear and well-lit for the best billboard display.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <Eye className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                2. Get Approved
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Our team reviews your submission and frames it with our professional brand overlay 
                for the billboard display. Most submissions are approved within minutes.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                <Instagram className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                3. Go Viral
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                Watch your selfie appear on the massive billboard and share it on Instagram with 
                #GurgaonBillboard. Tag friends and create unforgettable memories!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gurgaon Billboard Highlight Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Gurgaon&apos;s Billboard is Special
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience something truly unique - India&apos;s first open public billboard designed specifically for selfie sharing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Prime Location</h3>
              <p className="text-slate-600">Located in the heart of Gurgaon&apos;s business district, visible to thousands daily</p>
            </div>

            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">First of its Kind</h3>
              <p className="text-slate-600">India&apos;s first open public billboard dedicated to selfie sharing and community engagement</p>
            </div>

            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Community Driven</h3>
              <p className="text-slate-600">Built by the community, for the community - your selfies create the content</p>
            </div>

            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">24/7 Live</h3>
              <p className="text-slate-600">Your selfie could be displayed at any time, day or night, for maximum visibility</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Methods Section */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Upload Your Selfie
            </h2>
            <p className="text-xl text-slate-600">
              Choose your preferred method to share your moment on Gurgaon&apos;s billboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link
              href="/upload"
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors">
                  <Camera className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Web Upload
                </h3>
                <p className="text-slate-600 mb-6 text-lg">
                  Upload directly through our website with your name and Instagram handle. 
                  Get instant preview and professional framing.
                </p>
                <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700 text-lg">
                  Upload Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
                  <MessageCircle className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  WhatsApp Upload
                </h3>
                <p className="text-slate-600 mb-6 text-lg">
                  Send your selfie directly to our WhatsApp number for instant upload. 
                  Quick and easy for on-the-go sharing.
                </p>
                <div className="text-blue-600 font-semibold text-lg">
                  +91 98765 43210
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make Your Mark in Gurgaon?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of others who have shared their selfies on India&apos;s first public billboard
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
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
              #GurgaonBillboard
            </h3>
            <p className="text-gray-300 mb-6">
              India&apos;s first open public billboard for selfies - Located in Gurgaon, Haryana
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                href="/upload"
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                Upload
              </Link>
              <Link
                href="/billboard"
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                Live Billboard
              </Link>
              <Link
                href="/admin"
                className="text-gray-300 hover:text-blue-400 transition-colors"
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