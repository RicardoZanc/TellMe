"use client"

import { useState } from "react"
import { useReactions } from "@/hooks/use-reactions"
import { useAuth } from "@/hooks/use-auth"
import type { PostWithStats } from "@/services/post.service"

export function usePostReactions(initialPost: PostWithStats) {
  const [currentPost, setCurrentPost] = useState(initialPost)
  const { togglePostReaction, isLoading } = useReactions()
  const { user } = useAuth()

  const handleReaction = async (type: "LIKE" | "DISLIKE") => {
    console.log("handleReaction called with:", { type, user, isLoading })
    
    if (!user || isLoading) {
      console.log("Reaction blocked - no user or loading:", { user: !!user, isLoading })
      return
    }

    try {
      const result = await togglePostReaction(currentPost.id, type)
      
      // Update local state based on API response
      if (result.result.action === 'removed') {
        setCurrentPost(prev => ({
          ...prev,
          userReaction: null,
          reactions: {
            ...prev.reactions,
            [type.toLowerCase() + 's']: prev.reactions[type.toLowerCase() + 's' as keyof typeof prev.reactions] - 1
          }
        }))
      } else {
        // Added reaction
        setCurrentPost(prev => {
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
      console.error('Error handling reaction:', error)
      console.error('Error details:', error)
    }
  }

  return {
    currentPost,
    handleReaction,
    isLoading
  }
} 