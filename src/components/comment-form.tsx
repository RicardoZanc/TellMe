"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

interface CommentFormProps {
  onSubmit: (content: string, parentCommentId?: string) => Promise<void>
  parentCommentId?: string
  placeholder?: string
}

export function CommentForm({ onSubmit, parentCommentId, placeholder = "Escreva um comentário..." }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(content.trim(), parentCommentId)
      setContent("")
    } catch (error) {
      console.error("Comment submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 