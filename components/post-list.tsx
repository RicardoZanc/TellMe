"use client"

import { usePosts } from "@/contexts/posts-context"
import { PostCard } from "@/components/post-card"

export function PostList() {
  const { posts, isLoading, error } = usePosts()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erro ao carregar posts: {error}</div>
  }

  if (posts.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum post encontrado. Seja o primeiro a postar!</div>
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
