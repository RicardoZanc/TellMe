"use client"

import { useState } from "react"
import type { PostWithStats } from "@/services/post.service"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface EditPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: PostWithStats
  onSuccess: (updatedPost: PostWithStats) => void
}

export function EditPostDialog({ open, onOpenChange, post, onSuccess }: EditPostDialogProps) {
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update post")
      }

      const { post: updatedPost } = await response.json()
      
      // Create updated post with stats
      const updatedPostWithStats: PostWithStats = {
        ...post,
        ...updatedPost,
        title: updatedPost.title,
        content: updatedPost.content,
      }
      
      onSuccess(updatedPostWithStats)
    } catch (error) {
      console.error("Update post error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setTitle(post.title)
    setContent(post.content)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do seu post"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-content">Conteúdo</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo do seu post"
              rows={6}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSubmitting} className="gap-2">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 