"use client"

import { useParams } from "next/navigation"
import { usePost } from "@/hooks/use-post"
import { useComments } from "@/hooks/use-comments"
import { Header } from "@/components/header"
import { PostDetail } from "@/components/post-detail"
import { CommentList } from "@/components/comment-list"
import { CommentForm } from "@/components/comment-form"

export default function PostPage() {
  const params = useParams()
  const postId = params.id as string
  const { post, isLoading: postLoading } = usePost(postId)
  const { comments, isLoading: commentsLoading, createComment } = useComments(postId)

  if (postLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </main>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto text-center py-8">
            <p className="text-gray-500">Post não encontrado</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <PostDetail post={post} />
          <CommentForm onSubmit={createComment} />
          <CommentList comments={comments} isLoading={commentsLoading} />
        </div>
      </main>
    </div>
  )
}
