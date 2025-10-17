"use client";
import React, { useState, useRef } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import Button from "./Button";

const FileUpload = ({ onFileSelect, accept = ".pdf", multiple = false, maxSize = 10 }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size exceeds ${maxSize}MB` };
    }
    return { valid: true };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleChange = (e) => {
    e.preventDefault();
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (newFiles) => {
    const validFiles = [];
    const newStatus = { ...uploadStatus };

    newFiles.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
        newStatus[file.name] = { status: "ready", progress: 0 };
      } else {
        newStatus[file.name] = { status: "error", error: validation.error };
      }
    });

    setFiles((prev) => (multiple ? [...prev, ...validFiles] : validFiles));
    setUploadStatus(newStatus);

    if (onFileSelect) {
      onFileSelect(validFiles);
    }
  };

  const removeFile = (fileName) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
    const newStatus = { ...uploadStatus };
    delete newStatus[fileName];
    setUploadStatus(newStatus);
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
          dragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-700 hover:border-gray-600"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center p-8 sm:p-12">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Upload size={32} className="text-blue-500" />
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">
            Drop your files here
          </h3>
          <p className="text-gray-400 text-sm mb-4 text-center">
            or click to browse from your computer
          </p>
          
          <Button variant="primary" size="md" onClick={onButtonClick}>
            <Upload size={18} />
            Select Files
          </Button>
          
          <p className="text-gray-500 text-xs mt-4">
            Supports PDF files up to {maxSize}MB
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            Selected Files ({files.length})
          </h4>
          {files.map((file) => {
            const status = uploadStatus[file.name] || {};
            return (
              <div
                key={file.name}
                className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <File size={20} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {status.status === "success" && (
                    <CheckCircle size={20} className="text-green-500" />
                  )}
                  {status.status === "error" && (
                    <AlertCircle size={20} className="text-red-500" />
                  )}
                  <button
                    onClick={() => removeFile(file.name)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
