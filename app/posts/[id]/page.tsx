"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { usePost } from "@/hooks/use-post"
import { useComments } from "@/hooks/use-comments"
import { Header } from "@/components/header"
import { PostDetail } from "@/components/post-detail"
import { CommentList } from "@/components/comment-list"
import { CommentForm } from "@/components/comment-form"
import type { PostWithStats } from "@/services/post.service"

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { post, isLoading: postLoading } = usePost(postId)
  const { comments, isLoading: commentsLoading, createComment } = useComments(postId)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [currentPost, setCurrentPost] = useState<PostWithStats | null>(null)

  const handleReply = async (parentId: string, content: string) => {
    await createComment(content, parentId)
  }

  const handleCreateComment = async (content: string) => {
    await createComment(content)
    setShowCommentForm(false) // Hide form after submitting
  }

  const handlePostUpdated = (updatedPost: PostWithStats) => {
    setCurrentPost(updatedPost)
  }

  const handlePostDeleted = () => {
    router.push("/") // Redirect to home after deletion
  }

  // Use currentPost if available, otherwise use post from hook
  const displayPost = currentPost || post

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

  if (!displayPost) {
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
          {displayPost && (
            <PostDetail 
              post={displayPost} 
              onShowComments={() => setShowCommentForm(!showCommentForm)}
              showingComments={showCommentForm}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          )}
          {showCommentForm && displayPost && (
            <CommentForm 
              onSubmit={handleCreateComment} 
              onCancel={() => setShowCommentForm(false)}
            />
          )}
          <CommentList comments={comments} isLoading={commentsLoading} onReply={handleReply} />
        </div>
      </main>
    </div>
  )
}
