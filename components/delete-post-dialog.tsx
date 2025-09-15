"use client"

import { useState } from "react"
import type { PostWithStats } from "@/services/post.service"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface DeletePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: PostWithStats
  onSuccess: () => void
}

export function DeletePostDialog({ open, onOpenChange, post, onSuccess }: DeletePostDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      onSuccess()
    } catch (error) {
      console.error("Delete post error:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <DialogTitle>Confirmar deleção</DialogTitle>
          </div>
          <DialogDescription>
            Tem certeza que deseja deletar o post "{post.title}"? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deletando..." : "Deletar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 