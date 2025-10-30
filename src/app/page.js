import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { MessageCircle, FileText, Globe, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
            <SignedOut>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button variant="outline" asChild>
                <Link href="/chat">Go to Chat</Link>
              </Button>
              <UserButton />
            Deploy Now
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            >
            Documentation
          </a>
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
          
          <h1 className="mb-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
            Chat with Your Documents
            <br />
            <span className="text-primary">Like Never Before</span>
          </h1>
          
          <p className="mb-10 max-w-2xl text-xl text-muted-foreground">
            Upload PDFs or index websites, then ask questions and get instant AI-powered answers
            with citations from your documents.
          </p>

          <div className="flex flex-wrap gap-4">
            <SignedOut>
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-in">
                  Sign In
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button size="lg" asChild>
                <Link href="/chat">
                  Go to Dashboard
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </SignedIn>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 text-left">
              <FileText className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">PDF Support</h3>
              <p className="text-muted-foreground">
                Upload any PDF document and chat with it instantly. Extract information with ease.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <Globe className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Website Indexing</h3>
              <p className="text-muted-foreground">
                Index entire websites and ask questions about their content in real-time.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <Zap className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Instant Answers</h3>
              <p className="text-muted-foreground">
                Get AI-powered responses in seconds with relevant citations from your sources.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <MessageCircle className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Smart Conversations</h3>
              <p className="text-muted-foreground">
                Have natural conversations with context-aware AI that understands your documents.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <Shield className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your documents are encrypted and isolated. Only you have access to your data.
              </p>
            </Card>

            <Card className="p-6 text-left">
              <Sparkles className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-semibold">Advanced AI</h3>
              <p className="text-muted-foreground">
                Powered by OpenAI's latest models for accurate and intelligent responses.
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
                <Link href="/sign-up">
                  Start Free Today
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/chat">
                  Go to Dashboard
                </Link>
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
