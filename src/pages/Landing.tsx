import { Link } from 'react-router-dom';
import { FileText, Sparkles, Lock, Zap, FileType, LayoutGrid as Layout } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">DocuFlex</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Smart Content Conversion</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Create Professional Documents in{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Seconds
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform your content into beautifully formatted PDFs, DOCX files, and HTML documents with DocuFlex's intelligent conversion engine.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/30 text-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/editor"
              className="inline-flex items-center justify-center bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-lg border border-slate-200 text-lg"
            >
              Try Editor
            </Link>
          </div>
        </div>

        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-700/20 blur-3xl"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-5xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
              <FileText className="w-24 h-24 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features</h2>
          <p className="text-xl text-slate-600">Everything you need to create professional documents</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <FileType className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Multiple Formats</h3>
            <p className="text-slate-600 leading-relaxed">
              Export your documents as PDF, DOCX, or HTML with a single click. Perfect for any use case.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <Layout className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Beautiful Templates</h3>
            <p className="text-slate-600 leading-relaxed">
              Choose from professionally designed templates for resumes, reports, and blog posts.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
            <p className="text-slate-600 leading-relaxed">
              Convert your documents instantly with our optimized conversion engine. No waiting.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Lock className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Private</h3>
            <p className="text-slate-600 leading-relaxed">
              Your documents are encrypted and secured. We never share your data with third parties.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-7 h-7 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Rich Text Editor</h3>
            <p className="text-slate-600 leading-relaxed">
              Write with our powerful editor supporting plain text, markdown, and rich formatting.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Sanitization</h3>
            <p className="text-slate-600 leading-relaxed">
              Automatic content sanitization protects against XSS and ensures clean output.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-xl text-slate-600">Create professional documents in three simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Write Your Content</h3>
            <p className="text-slate-600">
              Use our editor to write in plain text, markdown, or rich text format with live preview.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Choose Template</h3>
            <p className="text-slate-600">
              Select from our professionally designed templates or create your own custom layout.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold shadow-lg">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Export & Download</h3>
            <p className="text-slate-600">
              Convert to your desired format and download instantly. Your document is ready to use.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users creating professional documents with DocuFlex
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-xl text-lg"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-slate-600">
            <p>&copy; 2024 DocuFlex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
