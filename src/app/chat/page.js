"use client";
import React, { useState, useRef, useEffect } from "react";
import { Upload, Plus, Menu, FileText, Sparkles, X } from "lucide-react";
import Button from "@/components/ui/Button";
import FileUpload from "@/components/ui/FileUpload";
import MessageBubble from "@/components/chat/MessageBubble";
import DocumentList from "@/components/chat/DocumentList";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load documents and chat history on mount
    loadDocuments();
    loadChatHistory();
    loadSelectedDocument();
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // Save selected document to localStorage
  useEffect(() => {
    if (selectedDocument) {
      localStorage.setItem(
        "selectedDocument",
        JSON.stringify(selectedDocument)
      );
    }
  }, [selectedDocument]);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem("documents", JSON.stringify(documents));
    }
  }, [documents]);

  const loadChatHistory = () => {
    try {
      const savedHistory = localStorage.getItem("chatHistory");
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const loadSelectedDocument = () => {
    try {
      const savedDoc = localStorage.getItem("selectedDocument");
      if (savedDoc) {
        setSelectedDocument(JSON.parse(savedDoc));
      }
    } catch (error) {
      console.error("Error loading selected document:", error);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem("chatHistory");
  };

  const loadDocuments = async () => {
    try {
      // First try to load from localStorage
      const savedDocs = localStorage.getItem("documents");
      if (savedDocs) {
        const parsedDocs = JSON.parse(savedDocs);
        setDocuments(parsedDocs);
        console.log(
          "📚 Loaded documents from localStorage:",
          parsedDocs.length
        );
      }

      // Then fetch from API (will override if available)
      const response = await fetch("/api/upload");
      const data = await response.json();
      if (data.success && data.documents.length > 0) {
        setDocuments(data.documents);
        console.log("📚 Loaded documents from API:", data.documents.length);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      // If API fails, keep localStorage version
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const file = files[0]; // Handle one file at a time

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Add to documents list
        const newDoc = {
          documentId: data.documentId,
          documentName: data.documentName,
          numPages: data.numPages,
        };
        setDocuments((prev) => [...prev, newDoc]);
        setSelectedDocument(newDoc);
        setShowUploadModal(false);

        // Add welcome message for the document
        setMessages([
          {
            id: Date.now(),
            text: `Document "${data.documentName}" uploaded successfully! ${data.message}`,
            isUser: false,
          },
        ]);
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!selectedDocument) {
      alert("Please select a document first");
      return;
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: message,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message,
          documentId: selectedDocument.documentId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add AI response
        const aiMessage = {
          id: Date.now() + 1,
          text: data.answer,
          isUser: false,
          sources: data.sources,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDocument = async (documentId) => {
    if (!confirm("Are you sure you want to remove this document?")) return;

    try {
      const response = await fetch(`/api/upload?documentId=${documentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setDocuments((prev) =>
          prev.filter((doc) => doc.documentId !== documentId)
        );
        if (selectedDocument?.documentId === documentId) {
          setSelectedDocument(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Error removing document:", error);
      alert("Failed to remove document");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-blue-500" />
              Askly AI
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X size={18} />
            </Button>
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={18} />
            Upload Document
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Your Documents
          </h3>
          <DocumentList
            documents={documents}
            selectedDocument={selectedDocument}
            onSelect={setSelectedDocument}
            onRemove={handleRemoveDocument}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </Button>
            )}
            {selectedDocument ? (
              <>
                <FileText size={20} className="text-blue-500" />
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-white">
                    {selectedDocument.documentName}
                  </h1>
                  <p className="text-xs text-gray-400">
                    {selectedDocument.numPages} pages
                  </p>
                </div>
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChatHistory}
                    className="text-gray-400 hover:text-white"
                    title="Clear chat history"
                  >
                    Clear Chat
                  </Button>
                )}
              </>
            ) : (
              <h1 className="text-lg font-semibold text-gray-400">
                Select a document to start chatting
              </h1>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={40} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Start a conversation
                </h2>
                <p className="text-gray-400 mb-6">
                  {selectedDocument
                    ? "Ask me anything about your document"
                    : "Upload a document to begin chatting"}
                </p>
                {!selectedDocument && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowUploadModal(true)}
                  >
                    <Upload size={20} />
                    Upload Your First Document
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg.text}
                  isUser={msg.isUser}
                />
              ))}
              {isLoading && <MessageBubble isUser={false} isLoading={true} />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={!selectedDocument || isLoading}
          placeholder={
            selectedDocument
              ? "Ask a question about your document..."
              : "Select a document to start chatting..."
          }
        />
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Upload Document</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadModal(false)}
              >
                <X size={20} />
              </Button>
            </div>

            <FileUpload
              onFileSelect={handleFileUpload}
              accept=".pdf"
              maxSize={10}
            />

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400 font-medium mb-1">
                📄 Supported Documents
              </p>
              <p className="text-xs text-gray-400">
                • Text-based PDFs (native text extraction)
                <br />
                • Scanned PDFs (OCR-powered extraction)
                <br />• Handwritten notes (OCR-powered extraction)
              </p>
            </div>

            {uploadingFiles && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Processing your document...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
