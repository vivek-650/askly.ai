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
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [conversations, setConversations] = useState([
    { id: "1", title: "New Conversation", messages: 0, date: "Today" },
  ]);
  const [activeConversation, setActiveConversation] = useState("1");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user documents
  useEffect(() => {
    if (isSignedIn) {
      // Fetch documents from API
      setDocuments([
        {
          id: "1",
          name: "Project Documentation.pdf",
          type: "pdf",
          date: "2 hours ago",
        },
        {
          id: "2",
          name: "Research Paper.pdf",
          type: "pdf",
          date: "Yesterday",
        },
        {
          id: "3",
          name: "example.com",
          type: "website",
          date: "2 days ago",
        },
      ]);
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

  const handleNewConversation = () => {
    const newConv = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: 0,
      date: "Now",
    };
    setConversations([newConv, ...conversations]);
    setActiveConversation(newConv.id);
    setMessages([]);
    setSelectedDocument(null);
  };

  const handleDeleteConversation = (id) => {
    setConversations(conversations.filter((conv) => conv.id !== id));
    if (activeConversation === id) {
      setActiveConversation(conversations[0]?.id);
      setMessages([]);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">Askly AI</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewConversation}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* Conversations */}
            <SidebarGroup>
              <SidebarGroupLabel>Conversations</SidebarGroupLabel>
              <SidebarGroupContent>
                <ScrollArea className="h-[200px]">
                  <SidebarMenu>
                    {conversations.map((conv) => (
                      <SidebarMenuItem key={conv.id}>
                        <div className="group relative flex w-full items-center">
                          <SidebarMenuButton
                            onClick={() => setActiveConversation(conv.id)}
                            isActive={activeConversation === conv.id}
                            className="flex-1"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-sm">{conv.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {conv.date}
                              </p>
                            </div>
                          </SidebarMenuButton>
                          <button
                            className="absolute right-2 h-6 w-6 rounded-md opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator className="my-2" />

            {/* Documents */}
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center justify-between">
                <span>Documents</span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Upload className="h-3 w-3" />
                </Button>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <ScrollArea className="h-[250px]">
                  <SidebarMenu>
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

          <SidebarFooter className="border-t p-4">
            {isSignedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
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
                  <DropdownMenuSeparator />
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
                  <DropdownMenuSeparator />
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
        <div className="flex flex-1 flex-col">
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
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
              <Button variant="outline" size="sm">
                <LinkIcon className="mr-2 h-4 w-4" />
                Add Website
              </Button>
            </div>
          </header>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
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
    </SidebarProvider>
  );
}
