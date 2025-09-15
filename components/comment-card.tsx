"use client"

import { useState } from "react"
import type { CommentWithStats } from "@/services/comment.service"
import { useCommentReactions } from "@/hooks/use-comment-reactions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, Reply, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { CommentForm } from "./comment-form"

interface CommentCardProps {
  comment: CommentWithStats
  isReply?: boolean
  onReply?: (parentId: string, content: string) => Promise<void>
}

export function CommentCard({ comment, isReply = false, onReply }: CommentCardProps) {
  const { currentComment, handleReaction, isLoading } = useCommentReactions(comment)
  const [showReplyForm, setShowReplyForm] = useState(false)



  const handleReply = async (content: string) => {
    if (!onReply) return
    try {
      await onReply(currentComment.id, content)
      setShowReplyForm(false)
    } catch (error) {
      console.error("Reply error:", error)
    }
  }

  return (
    <div className={cn("space-y-2", isReply && "ml-8")}>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium">{currentComment.owner.username}</p>
                <p className="text-xs text-gray-500">{new Date(currentComment.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <p className="text-sm mb-3">{currentComment.content}</p>

              <div className="flex items-end justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction("LIKE")}
                  disabled={isLoading}
                  className={cn("gap-1 h-8 px-2", currentComment.userReaction === "LIKE" && "text-blue-600 bg-blue-50")}
                >
                  <ThumbsUp className="h-3 w-3" />
                  {currentComment.reactions.likes}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction("DISLIKE")}
                  disabled={isLoading}
                  className={cn("gap-1 h-8 px-2", currentComment.userReaction === "DISLIKE" && "text-red-600 bg-red-50")}
                >
                  <ThumbsDown className="h-3 w-3" />
                  {currentComment.reactions.dislikes}
                </Button>

                {onReply && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 h-8 px-2"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                  >
                    <Reply className="h-3 w-3" />
                    Responder
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply form */}
      {showReplyForm && (
        <div className="ml-8">
          <CommentForm 
            onSubmit={handleReply}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Escreva uma resposta..."
          />
        </div>
      )}

      {/* Render replies */}
      {currentComment.replies && currentComment.replies.length > 0 && (
        <div className="space-y-2">
          {currentComment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} isReply onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  )
}
