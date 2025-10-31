"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  FileText,
  Globe,
  Trash2,
  Plus,
  Upload,
  Link as LinkIcon,
  User,
  Bot,
  Loader2,
  Menu,
  Settings,
  LogOut,
  Crown,
  Youtube,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { WebsiteURLModal } from "@/components/modals/WebsiteURLModal";
import { YouTubeURLModal } from "@/components/modals/YouTubeURLModal";
import { UploadSourcesModal } from "@/components/modals/UploadSourcesModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatPage() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [conversations, setConversations] = useState([
    { id: "1", title: "New Conversation", messages: 0, date: "Today" },
  ]);
  const [activeConversation, setActiveConversation] = useState("1");
  const messagesEndRef = useRef(null);

  // Modal states
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleUploadOptionSelect = (optionId) => {
    setIsUploadModalOpen(false);
    if (optionId === "website") {
      setIsWebsiteModalOpen(true);
    } else if (optionId === "youtube") {
      setIsYouTubeModalOpen(true);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    const uploadId = Date.now().toString();

    // Add to uploading state immediately
    setUploadingDocs((prev) => [
      ...prev,
      {
        id: uploadId,
        name: file.name,
        type: "pdf",
        status: "uploading",
        progress: 0,
      },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      // Remove from uploading and add to documents
      setUploadingDocs((prev) => prev.filter((doc) => doc.id !== uploadId));
      setDocuments((prev) => [
        ...prev,
        {
          id: result.data.collectionName,
          name: file.name,
          type: "pdf",
          date: "Just now",
          collectionName: result.data.collectionName,
          chunks: result.data.chunks,
        },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      // Update status to error
      setUploadingDocs((prev) =>
        prev.map((doc) =>
          doc.id === uploadId ? { ...doc, status: "error" } : doc
        )
      );
    }
  };

  // Handle website URL submission
  const handleWebsiteSubmit = async (urls) => {
    for (const url of urls) {
      const uploadId = Date.now().toString() + Math.random();

      setUploadingDocs((prev) => [
        ...prev,
        {
          id: uploadId,
          name: url,
          type: "website",
          status: "uploading",
          progress: 0,
        },
      ]);

      try {
        const urlName = new URL(url).hostname;
        const response = await fetch("/api/upload/website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, urlName }),
        });

        if (!response.ok) {
          throw new Error("Website indexing failed");
        }

        const result = await response.json();

        setUploadingDocs((prev) => prev.filter((doc) => doc.id !== uploadId));
        setDocuments((prev) => [
          ...prev,
          {
            id: result.data.collectionName,
            name: urlName,
            type: "website",
            date: "Just now",
            collectionName: result.data.collectionName,
            chunks: result.data.chunks,
          },
        ]);
      } catch (error) {
        console.error("Website indexing error:", error);
        setUploadingDocs((prev) =>
          prev.map((doc) =>
            doc.id === uploadId ? { ...doc, status: "error" } : doc
          )
        );
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user documents - remove mock data
  useEffect(() => {
    if (isSignedIn) {
      // Fetch real documents from API if needed
      // For now, documents will be populated by uploads
    }
  }, [isSignedIn]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: inputMessage,
          documentId: selectedDocument?.id,
          collectionName:
            selectedDocument?.type === "website"
              ? "website_content"
              : "pdf_documents",
        }),
      });

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.answer || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, there was an error processing your request.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background p-2">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">Askly AI</h2>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* Documents */}
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center justify-between">
                <span>Documents</span>
                <Badge variant="secondary" className="ml-auto">
                  {documents.length + uploadingDocs.length}
                </Badge>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <ScrollArea className="h-[250px]">
                  <SidebarMenu>
                    {/* Uploading documents with progress */}
                    {uploadingDocs.map((doc) => (
                      <SidebarMenuItem key={doc.id}>
                        <div className="flex flex-col gap-2 px-2 py-2 rounded-md bg-muted/50">
                          <div className="flex items-center gap-2">
                            {doc.type === "pdf" ? (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-sm">{doc.name}</p>
                            </div>
                          </div>
                          {doc.status === "uploading" && (
                            <div className="space-y-1">
                              <Progress
                                value={doc.progress || 50}
                                className="h-1"
                              />
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                <span className="text-xs text-muted-foreground">
                                  Indexing...
                                </span>
                              </div>
                            </div>
                          )}
                          {doc.status === "error" && (
                            <span className="text-xs text-destructive">
                              Upload failed
                            </span>
                          )}
                        </div>
                      </SidebarMenuItem>
                    ))}

                    {/* Successfully uploaded documents */}
                    {documents.map((doc) => (
                      <SidebarMenuItem key={doc.id}>
                        <SidebarMenuButton
                          onClick={() => setSelectedDocument(doc)}
                          isActive={selectedDocument?.id === doc.id}
                        >
                          {doc.type === "pdf" ? (
                            <FileText className="h-4 w-4" />
                          ) : (
                            <Globe className="h-4 w-4" />
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.date}
                            </p>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="py-4">
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 p-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback>
                        {user?.firstName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden text-left">
                      <p className="truncate text-sm font-medium">
                        {user?.fullName || "User"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  {/* <DropdownMenuSeparator /> */}
                  <DropdownMenuItem asChild>
                    <Link href="/pricing">
                      <Crown className="mr-2 h-4 w-4" />
                      <span>Upgrade Plan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {/* <DropdownMenuSeparator /> */}
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="w-full" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            )}
          </SidebarFooter>
        </Sidebar>

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col border rounded-3xl dark:bg-black/60">
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold">
                  {selectedDocument?.name || "Chat with your documents"}
                </h1>
                {selectedDocument && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {selectedDocument.type === "pdf" ? "PDF" : "Website"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWebsiteModalOpen(true)}
              >
                <Globe className="mr-2 h-4 w-4" />
                Website
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsYouTubeModalOpen(true)}
              >
                <Youtube className="mr-2 h-4 w-4" />
                YouTube
              </Button>
            </div>
          </header>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 ">
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 py-20 text-center">
                  <div className="rounded-full bg-primary/10 p-6">
                    <MessageCircle className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">
                      Start a conversation
                    </h2>
                    <p className="text-muted-foreground">
                      Ask questions about your documents or websites
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      📊 Summarize this document
                    </Button>
                    <Button variant="outline" size="sm">
                      🔍 Find key insights
                    </Button>
                    <Button variant="outline" size="sm">
                      💡 Explain the main concepts
                    </Button>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Card
                      className={`max-w-[80%] p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                      {message.sources && (
                        <div className="mt-2 border-t pt-2 text-xs opacity-70">
                          <p className="font-medium">Sources:</p>
                          <p>{message.sources.length} references found</p>
                        </div>
                      )}
                    </Card>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="max-w-[80%] bg-muted p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    selectedDocument
                      ? `Ask about ${selectedDocument.name}...`
                      : "Ask a question..."
                  }
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Askly AI can make mistakes. Check important info.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadSourcesModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onSelectOption={handleUploadOptionSelect}
        onFileUpload={handleFileUpload}
      />
      <WebsiteURLModal
        open={isWebsiteModalOpen}
        onOpenChange={setIsWebsiteModalOpen}
        onSubmit={handleWebsiteSubmit}
      />
      <YouTubeURLModal
        open={isYouTubeModalOpen}
        onOpenChange={setIsYouTubeModalOpen}
      />
    </SidebarProvider>
  );
}
