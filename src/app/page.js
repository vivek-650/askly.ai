"use client";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  MessageSquare,
  Zap,
  Shield,
  Upload,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={28} className="text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Askly AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="md">
                Login
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="primary" size="md">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">
              Powered by GPT-4 & Advanced OCR
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Chat with Your PDFs
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Like Never Before
            </span>
          </h2>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Upload any PDF - text-based or scanned handwritten notes - and have
            intelligent conversations powered by AI. Extract insights instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button variant="primary" size="xl" icon={<Upload size={20} />}>
                Start Chatting Now
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-gray-400">Free to Use</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">OCR</div>
              <div className="text-sm text-gray-400">Powered Extraction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">GPT-4</div>
              <div className="text-sm text-gray-400">AI Technology</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">
            Everything You Need
          </h3>
          <p className="text-gray-400 text-lg">
            Powerful features to help you understand your documents better
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
              <FileText size={24} className="text-blue-500" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-3">
              Smart PDF Processing
            </h4>
            <p className="text-gray-400">
              Automatically detects text-based or scanned PDFs and extracts
              content using appropriate methods - native text extraction or OCR.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-purple-500" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-3">
              Intelligent Conversations
            </h4>
            <p className="text-gray-400">
              Ask questions in natural language and get accurate answers with
              source citations from your documents.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-green-500/50 transition-all">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
              <Zap size={24} className="text-green-500" />
            </div>
            <h4 className="text-xl font-semibold text-white mb-3">
              Lightning Fast
            </h4>
            <p className="text-gray-400">
              Powered by Qdrant vector database and LangChain for blazing fast
              semantic search and retrieval.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">How It Works</h3>
          <p className="text-gray-400 text-lg">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/10 border-2 border-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-500">1</span>
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">
              Upload PDF
            </h4>
            <p className="text-gray-400">
              Drag and drop any PDF file - text or scanned handwritten notes
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/10 border-2 border-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-500">2</span>
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">
              AI Processes
            </h4>
            <p className="text-gray-400">
              Our AI extracts and indexes your document content intelligently
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-500">3</span>
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">
              Start Chatting
            </h4>
            <p className="text-gray-400">
              Ask questions and get instant, accurate answers from your
              documents
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your PDFs?
          </h3>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already chatting with their
            documents using AI
          </p>
          <Link href="/chat">
            <Button
              variant="secondary"
              size="xl"
              icon={<Sparkles size={20} />}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={24} className="text-blue-500" />
              <span className="text-white font-semibold">Askly AI</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Askly AI. Built with LangChain, OpenAI & Qdrant.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
