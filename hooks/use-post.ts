"use client"

import { useState, useEffect } from "react"
import type { Post } from "@prisma/client"

export function usePost(id: string) {
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPost = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/posts/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch post")
      }

      const data = await response.json()
      setPost(data.post)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPost()
    }
  }, [id])

  return {
    post,
    isLoading,
    error,
    refetch: fetchPost,
  }
}
