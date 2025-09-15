"use client"

import { useState } from "react"
import type { ReactionType } from "@prisma/client"

export function useReactions() {
  const [isLoading, setIsLoading] = useState(false)

  const togglePostReaction = async (postId: string, type: ReactionType) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to toggle reaction")
      }

      return await response.json()
    } finally {
      setIsLoading(false)
    }
  }

  const addCommentReaction = async (commentId: string, type: ReactionType) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/comments/${commentId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add reaction")
      }

      return await response.json()
    } finally {
      setIsLoading(false)
    }
  }

  const removeCommentReaction = async (commentId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/comments/${commentId}/reactions`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove reaction")
      }

      return await response.json()
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    togglePostReaction,
    addCommentReaction,
    removeCommentReaction,
  }
}
