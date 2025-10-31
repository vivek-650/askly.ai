"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Upload, Link2, Globe, Youtube, FileText, Copy, ClipboardCopy } from "lucide-react"

const uploadOptions = [
  {
    id: "file",
    icon: Upload,
    label: "Upload Files",
    description: "PDF, TXT, DOC"
  },
  {
    id: "link",
    icon: Link2,
    label: "Link",
    description: "Any URL"
  },
  {
    id: "website",
    icon: Globe,
    label: "Website",
    description: "Web pages"
  },
  {
    id: "youtube",
    icon: Youtube,
    label: "YouTube",
    description: "Video transcript"
  },
  {
    id: "paste-text",
    icon: FileText,
    label: "Paste text",
    description: "Add text directly"
  },
  {
    id: "copied-text",
    icon: ClipboardCopy,
    label: "Copied text",
    description: "From clipboard"
  }
]


export function UploadSourcesModal({ open, onOpenChange, onSelectOption, onFileUpload }) {
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFiles(e.target.files)
    }
  }

  const uploadFiles = async (files) => {
    setIsUploading(true)
    const fileArray = Array.from(files)
    
    for (const file of fileArray) {
      try {
        if (onFileUpload) {
          await onFileUpload(file)
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
      }
    }
    
    setIsUploading(false)
    onOpenChange(false)
  }

  const handleOptionClick = (optionId) => {
    console.log("Option clicked:", optionId)
    onSelectOption?.(optionId)
    if (optionId === "website") {
      // Will trigger WebsiteURLModal
    } else if (optionId === "youtube") {
      // Will trigger YouTubeURLModal
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-background">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle className="text-xl">Upload sources</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Choose how you want to add sources
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Drag and Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.txt,.doc,.docx"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isUploading ? "Uploading..." : "Drag and drop files here, or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, TXT, DOC, DOCX (Max 50MB)
                </p>
              </div>
            </div>
          </div>

          {/* Upload Options Grid */}
          <div>
            <p className="text-sm font-medium mb-3">Or choose an option:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {uploadOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Card
                    key={option.id}
                    className="p-4 hover:bg-accent cursor-pointer transition-colors border-2 hover:border-primary"
                    onClick={() => handleOptionClick(option.id)}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <Icon className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• Maximum 50 sources per notebook</p>
            <p>• Each file must be under 50MB</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
