"use client"

import type { PostWithStats } from "@/services/post.service"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Edit, Trash2, ThumbsUp, ThumbsDown, MessageCircle, ChartNoAxesColumn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePostReactions } from "@/hooks/use-post-reactions"
import { cn } from "@/lib/utils"

interface PostDetailProps {
  post: PostWithStats
  onShowComments: () => void
  showingComments: boolean
}

export function PostDetail({ post, onShowComments, showingComments }: PostDetailProps) {
  const { currentPost, handleReaction, isLoading } = usePostReactions(post)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{currentPost.owner.username}</p>
              <p className="text-xs text-gray-500">{new Date(currentPost.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h1 className="text-2xl font-bold mb-4">{currentPost.title}</h1>
        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap">{currentPost.content}</p>
        </div>
        
        {/* Reaction and Comment Counts */}
        <div className="flex items-center justify-between text-sm border-t pt-4">
          <div className="flex items-center gap-1 text-gray-600">
            <ChartNoAxesColumn className="h-4 w-4" />
            <span>{currentPost.views}</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={onShowComments}
              className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
                showingComments ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{currentPost._count?.comments || 0}</span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction("LIKE")}
              disabled={isLoading}
              className={cn("gap-1", currentPost.userReaction === "LIKE" && "text-blue-600 bg-blue-50")}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{currentPost.reactions?.likes || 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction("DISLIKE")}
              disabled={isLoading}
              className={cn("gap-1", currentPost.userReaction === "DISLIKE" && "text-red-600 bg-red-50")}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{currentPost.reactions?.dislikes || 0}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
