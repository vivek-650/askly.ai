"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Youtube } from "lucide-react"

export function YouTubeURLModal({ open, onOpenChange }) {
  const [url, setUrl] = useState("")

  const handleInsert = () => {
    // Handle YouTube URL insertion logic
    console.log("Inserting YouTube URL:", url)
    onOpenChange(false)
    setUrl("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background">
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
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full p-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Only public YouTube videos are supported</p>
            <p>• The transcript will be imported as a source</p>
            <p>• Video must have captions available</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsert}
              disabled={!url.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Insert
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
