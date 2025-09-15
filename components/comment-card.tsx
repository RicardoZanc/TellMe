"use client"

import { useState } from "react"
import type { CommentWithStats } from "@/services/comment.service"
import { useReactions } from "@/hooks/use-reactions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, Reply, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommentCardProps {
  comment: CommentWithStats
  isReply?: boolean
}

export function CommentCard({ comment, isReply = false }: CommentCardProps) {
  const { addCommentReaction, removeCommentReaction } = useReactions()
  const [isReacting, setIsReacting] = useState(false)

  const handleReaction = async (type: "LIKE" | "DISLIKE") => {
    if (isReacting) return

    setIsReacting(true)
    try {
      if (comment.userReaction === type) {
        await removeCommentReaction(comment.id)
      } else {
        await addCommentReaction(comment.id, type)
      }
      // Note: In a real app, you'd want to refresh the comments here
    } catch (error) {
      console.error("Reaction error:", error)
    } finally {
      setIsReacting(false)
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
                <p className="text-sm font-medium">{comment.owner.username}</p>
                <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <p className="text-sm mb-3">{comment.content}</p>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction("LIKE")}
                  disabled={isReacting}
                  className={cn("gap-1 h-8 px-2", comment.userReaction === "LIKE" && "text-blue-600 bg-blue-50")}
                >
                  <ThumbsUp className="h-3 w-3" />
                  {comment.reactions.likes}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction("DISLIKE")}
                  disabled={isReacting}
                  className={cn("gap-1 h-8 px-2", comment.userReaction === "DISLIKE" && "text-red-600 bg-red-50")}
                >
                  <ThumbsDown className="h-3 w-3" />
                  {comment.reactions.dislikes}
                </Button>

                <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
                  <Reply className="h-3 w-3" />
                  Responder
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  )
}
