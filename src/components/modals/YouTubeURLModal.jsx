"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Youtube, Loader2 } from "lucide-react"

export function YouTubeURLModal({ open, onOpenChange, onYouTubeUpload }) {
  const [url, setUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const handleInsert = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    // Validate YouTube URL format
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    if (!youtubeRegex.test(url)) {
      setError("Please enter a valid YouTube URL")
      return
    }

    setError("")
    setIsUploading(true)

    try {
      if (onYouTubeUpload) {
        await onYouTubeUpload(url)
      }
      
      // Close modal and reset
      onOpenChange(false)
      setUrl("")
    } catch (err) {
      console.error("YouTube upload error:", err)
      setError(err.message || "Failed to index YouTube video")
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false)
      setUrl("")
      setError("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
              disabled={isUploading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                YouTube URL
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Paste in a YouTube URL below to upload as a source
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError("")
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isUploading}
            />
            {error && (
              <p className="text-xs text-destructive mt-2">{error}</p>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Only public YouTube videos are supported</p>
            <p>• The transcript will be imported with timestamps</p>
            <p>• Video must have captions/subtitles available</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsert}
              disabled={!url.trim() || isUploading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Indexing...
                </>
              ) : (
                "Insert"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
