"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const ChatInput = ({
  onSend,
  disabled = false,
  placeholder = "Ask a question...",
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle Ctrl + / to focus/unfocus input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Check for Ctrl + / (or Cmd + / on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        
        if (textareaRef.current) {
          // If input is already focused, blur it
          if (document.activeElement === textareaRef.current) {
            textareaRef.current.blur();
          } else {
            // Otherwise, focus it
            textareaRef.current.focus();
          }
        }
      }
    };

    // Add event listener to document
    document.addEventListener("keydown", handleGlobalKeyDown);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2 p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
        <div className="flex-1 relative">
          <Input
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none max-h-32 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: "48px" }}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!message.trim() || disabled}
          className="h-12 px-6"
        >
          <Send size={18} />
        </Button>
      </div>

      <p className="px-4 pb-3 text-xs text-gray-500 text-center">
        Press Enter to send, Shift + Enter for new line • Ctrl + / to focus input
      </p>
    </form>
  );
};

export default ChatInput;
