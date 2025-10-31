"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

export function WebsiteURLModal({ open, onOpenChange, onSubmit }) {
  const [urls, setUrls] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInsert = async () => {
    if (!urls.trim()) return
    
    setIsLoading(true)
    try {
      // Split URLs by newline and filter empty lines
      const urlList = urls
        .split("\n")
        .map(url => url.trim())
        .filter(url => url.length > 0)
      
      if (onSubmit) {
        await onSubmit(urlList)
      }
      
      onOpenChange(false)
      setUrls("")
    } catch (error) {
      console.error("Error submitting URLs:", error)
    } finally {
      setIsLoading(false)
    }
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
              <DialogTitle className="text-xl">Website URLs</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Paste in web URLs below to upload as sources
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://example.com&#10;https://another-example.com"
            className="w-full min-h-[200px] p-4 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          
          <div className="text-xs text-muted-foreground">
            <p>• Enter one URL per line</p>
            <p>• Public web pages only</p>
            <p>• Maximum 50 URLs at once</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsert}
              disabled={!urls.trim() || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
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
