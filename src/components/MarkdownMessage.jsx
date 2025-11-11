"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkdownMessage({ content, className = "" }) {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const codeIndex = `${codeString.substring(0, 20)}-${Math.random()}`;

            return !inline && match ? (
              <div className="relative group my-4">
                <div className="absolute right-2 top-2 z-10">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(codeString, codeIndex)}
                  >
                    {copiedCode === codeIndex ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-lg text-sm"
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="ml-4">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/50 pl-4 py-2 my-4 italic bg-muted/50 rounded-r">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-border rounded-lg">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted">{children}</thead>;
          },
          tr({ children }) {
            return <tr className="border-b border-border">{children}</tr>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-2 text-left font-semibold">{children}</th>
            );
          },
          td({ children }) {
            return <td className="px-4 py-2">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
