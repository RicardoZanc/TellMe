"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { PostWithStats } from "@/services/post.service"

interface PostsContextType {
  posts: PostWithStats[]
  isLoading: boolean
  error: string | null
  fetchPosts: () => Promise<void>
  createPost: (title: string, content: string) => Promise<any>
  updatePost: (id: string, title: string, content: string) => Promise<any>
  deletePost: (id: string) => Promise<void>
}

const PostsContext = createContext<PostsContextType | undefined>(undefined)

export function PostsProvider({ children }: { children: ReactNode }) {
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

  return (
    <PostsContext.Provider
      value={{
        posts,
        isLoading,
        error,
        fetchPosts,
        createPost,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </PostsContext.Provider>
  )
}

export function usePosts() {
  const context = useContext(PostsContext)
  if (context === undefined) {
    throw new Error("usePosts must be used within a PostsProvider")
  }
  return context
} 