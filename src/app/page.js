import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  MessageCircle,
  FileText,
  Globe,
  Zap,
  Shield,
  Sparkles,
  Play,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Askly AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignedOut>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Document Analysis</span>
          </div>

          <h1 className="mb-6 max-w-6xl text-8xl tracking-tight sm:text-6xl">
            Chat with Your Documents
            <br />
            <span className="text-primary">Like Never Before</span>
          </h1>

          <p className="mb-10 max-w-2xl text-xl text-muted-foreground">
            Upload PDFs or index websites, then ask questions and get instant
            AI-powered answers with citations from your documents.
          </p>

          <div className="flex flex-wrap gap-4">
            <SignedOut>
              <Button size="lg" asChild>
                <Link href="/sign-in">Get Started <ArrowRight className="inline-block bg-purple-600/30 border rounded-full" /></Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button size="lg" asChild>
                <Link href="/chat">Chat with Askly</Link>
              </Button>
            </SignedIn>
          </div>

          {/* Video Showcase Section */}
          <div className="mt-20 w-full max-w-6xl">
            <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-2 shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-primary/20 blur-3xl"></div>

              {/* Video Container */}
              <div className="relative aspect-video overflow-hidden rounded-xl bg-black/50 backdrop-blur-sm">
                {/* Placeholder - Replace with your actual video */}
                <video
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  poster="/video-thumbnail.jpg"
                  preload="metadata"
                >
                  <source
                    src="https://notebooklm.google/_/static/v4/videos/see_the_source_not_just_the_answer.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Caption */}
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Watch how Askly AI transforms document interaction in seconds.
                </p>
              </div>
            </div>

            {/* Stats Section Below Video */}
            <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">
                  Documents Processed
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">
                  Questions Answered
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">
                  99.9%
                </div>
                <div className="text-sm text-muted-foreground">
                  Accuracy Rate
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">
                  &lt;2s
                </div>
                <div className="text-sm text-muted-foreground">
                  Response Time
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 text-left">
              <FileText className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">PDF Support</h3>
              <p className="text-muted-foreground">
                Upload any PDF document and chat with it instantly. Extract
                information with ease.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <Globe className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Website Indexing</h3>
              <p className="text-muted-foreground">
                Index entire websites and ask questions about their content in
                real-time.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <Zap className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Instant Answers</h3>
              <p className="text-muted-foreground">
                Get AI-powered responses in seconds with relevant citations from
                your sources.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <MessageCircle className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">
                Smart Conversations
              </h3>
              <p className="text-muted-foreground">
                Have natural conversations with context-aware AI that
                understands your documents.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <Shield className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your documents are encrypted and isolated. Only you have access
                to your data.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <Sparkles className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Advanced AI</h3>
              <p className="text-muted-foreground">
                Powered by OpenAI latest models for accurate and intelligent
                responses.
              </p>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-20 rounded-xl bg-primary p-10 text-center text-primary-foreground">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to Transform Your Document Workflow?
            </h2>
            <p className="mb-6 text-lg opacity-90">
              Start with our free plan - 1 PDF and 2 websites included.
            </p>
            <SignedOut>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/sign-up">Start Free Today</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/chat">Go to Dashboard</Link>
              </Button>
            </SignedIn>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Askly AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
