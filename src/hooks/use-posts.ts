"use client"

import { useState, useEffect } from "react"
import type { PostWithStats } from "@/services/post.service"

export function usePosts() {
  const [posts, setPosts] = useState<PostWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/posts")

      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data = await response.json()
      setPosts(data.posts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const createPost = async (title: string, content: string) => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create post")
      }

      const data = await response.json()
      await fetchPosts() // Refresh posts list
      return data.post
    } catch (err) {
      throw err
    }
  }

  const updatePost = async (id: string, title: string, content: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update post")
      }

      const data = await response.json()
      await fetchPosts() // Refresh posts list
      return data.post
    } catch (err) {
      throw err
    }
  }

  const deletePost = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete post")
      }

      await fetchPosts() // Refresh posts list
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
  }
}
