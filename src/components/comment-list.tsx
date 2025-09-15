"use client"

import type { CommentWithStats } from "@/services/comment.service"
import { CommentCard } from "@/components/comment-card"

interface CommentListProps {
  comments: CommentWithStats[]
  isLoading: boolean
}

export function CommentList({ comments, isLoading }: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhum comentário ainda. Seja o primeiro a comentar!</div>
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </div>
  )
} 