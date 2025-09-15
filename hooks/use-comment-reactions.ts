"use client"

import { useState } from "react"
import { useReactions } from "@/hooks/use-reactions"
import { useAuth } from "@/hooks/use-auth"
import type { CommentWithStats } from "@/services/comment.service"

export function useCommentReactions(initialComment: CommentWithStats) {
  const [currentComment, setCurrentComment] = useState(initialComment)
  const { addCommentReaction, removeCommentReaction, isLoading } = useReactions()
  const { user } = useAuth()

  const handleReaction = async (type: "LIKE" | "DISLIKE") => {
    if (!user || isLoading) return

    try {
      if (currentComment.userReaction === type) {
        // Remove reaction if clicking the same one
        await removeCommentReaction(currentComment.id)
        setCurrentComment(prev => ({
          ...prev,
          userReaction: null,
          reactions: {
            ...prev.reactions,
            [type.toLowerCase() + 's']: prev.reactions[type.toLowerCase() + 's' as keyof typeof prev.reactions] - 1
          }
        }))
      } else {
        // Add or change reaction
        await addCommentReaction(currentComment.id, type)
        setCurrentComment(prev => {
          const newReactions = { ...prev.reactions }
          
          // Remove old reaction count if exists
          if (prev.userReaction) {
            const oldType = prev.userReaction.toLowerCase() + 's'
            newReactions[oldType as keyof typeof newReactions] = newReactions[oldType as keyof typeof newReactions] - 1
          }
          
          // Add new reaction count
          const newType = type.toLowerCase() + 's'
          newReactions[newType as keyof typeof newReactions] = newReactions[newType as keyof typeof newReactions] + 1
          
          return {
            ...prev,
            userReaction: type,
            reactions: newReactions
          }
        })
      }
    } catch (error) {
      console.error('Error handling comment reaction:', error)
    }
  }

  return {
    currentComment,
    handleReaction,
    isLoading
  }
} 