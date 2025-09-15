"use client"

import { useState, useEffect } from "react"
import type { CommentWithStats } from "@/services/comment.service"

export function useComments(postId: string) {
  const [comments, setComments] = useState<CommentWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/posts/${postId}/comments`)

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      setComments(data.comments)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const createComment = async (content: string, parentCommentId?: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          postId,
          parentCommentId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create comment")
      }

      const data = await response.json()
      await fetchComments() // Refresh comments list
      return data.comment
    } catch (err) {
      throw err
    }
  }

  const updateComment = async (id: string, content: string) => {
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update comment")
      }

      const data = await response.json()
      await fetchComments() // Refresh comments list
      return data.comment
    } catch (err) {
      throw err
    }
  }

  const deleteComment = async (id: string) => {
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete comment")
      }

      await fetchComments() // Refresh comments list
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    if (postId) {
      fetchComments()
    }
  }, [postId])

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  }
}
