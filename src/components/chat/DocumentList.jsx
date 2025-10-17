"use client";
import React from "react";
import { File, X, ChevronRight } from "lucide-react";
import Card from "../ui/Card";

const DocumentList = ({ documents, selectedDocument, onSelect, onRemove }) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
          <File size={32} className="text-gray-600" />
        </div>
        <p className="text-gray-400 text-sm mb-2">No documents uploaded</p>
        <p className="text-gray-500 text-xs">Upload a PDF to start chatting</p>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <Card
          key={doc.documentId}
          padding="sm"
          className={`group relative ${
            selectedDocument?.documentId === doc.documentId
              ? "border-blue-500 bg-blue-500/10"
              : ""
          }`}
          onClick={() => onSelect(doc)}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <File size={20} className="text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {doc.documentName}
              </p>
              <p className="text-xs text-gray-400">
                {doc.numPages || "N/A"} pages
              </p>
            </div>
            {selectedDocument?.documentId === doc.documentId && (
              <ChevronRight size={18} className="text-blue-500" />
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(doc.documentId);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
              >
                <X size={16} className="text-red-500" />
              </button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DocumentList;
