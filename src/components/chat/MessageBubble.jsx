"use client";
import React, { useState } from "react";
import { User, Bot, Loader2, Copy, Check } from "lucide-react";

const MessageBubble = ({ message, isUser, isLoading = false }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  // Function to parse message and extract code blocks
  const parseMessage = (text) => {
    if (!text) return [];
    
    // Split by code blocks (```language\ncode\n```)
    const parts = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'javascript',
        content: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    // If no code blocks found, return the whole message as text
    return parts.length === 0 ? [{ type: 'text', content: text }] : parts;
  };

  const copyToClipboard = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Thinking...</span>
        </div>
      );
    }

    const parts = parseMessage(message);

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <div key={index} className="my-3 first:mt-0 last:mb-0">
            <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-700">
              {/* Code header with language and copy button */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
                <span className="text-xs font-mono text-gray-400 uppercase">
                  {part.language}
                </span>
                <button
                  onClick={() => copyToClipboard(part.content, index)}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                  title="Copy code"
                >
                  {copiedCode === index ? (
                    <>
                      <Check size={14} className="text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Code content */}
              <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-gray-200 font-mono">{part.content}</code>
              </pre>
            </div>
          </div>
        );
      }

      // Regular text content
      return (
        <p key={index} className="text-sm leading-relaxed whitespace-pre-wrap">
          {part.content}
        </p>
      );
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Bot size={18} className="text-blue-400" />
        </div>
      )}
      
      <div
        className={`max-w-[75%] rounded-2xl ${
          isUser
            ? "bg-blue-600 text-white px-4 py-3"
            : "bg-gray-800 text-gray-200 border border-gray-700 px-4 py-3"
        }`}
      >
        {renderContent()}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <User size={18} className="text-gray-300" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
