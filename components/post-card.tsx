"use client"

import { useRouter } from "next/navigation"
import type { PostWithStats } from "@/services/post.service"
import { usePostReactions } from "@/hooks/use-post-reactions"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, MessageCircle, User, ChartNoAxesColumn } from "lucide-react"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: PostWithStats
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter()
  const { currentPost, handleReaction, isLoading } = usePostReactions(post)

  const handlePostClick = () => {
    router.push(`/posts/${currentPost.id}`)
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{currentPost.owner.username}</p>
            <p className="text-xs text-gray-500">{new Date(currentPost.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent onClick={handlePostClick}>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{currentPost.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{currentPost.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-600">
            <ChartNoAxesColumn className="h-4 w-4" />
            <span>{currentPost.views}</span>
          </div>
          <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="gap-1">
              <MessageCircle className="h-4 w-4" />
              {currentPost._count.comments}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction("LIKE")}
              disabled={isLoading}
              className={cn("gap-1", currentPost.userReaction === "LIKE" && "text-blue-600 bg-blue-50")}
            >
              <ThumbsUp className="h-4 w-4" />
              {currentPost.reactions.likes}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction("DISLIKE")}
              disabled={isLoading}
              className={cn("gap-1", currentPost.userReaction === "DISLIKE" && "text-red-600 bg-red-50")}
            >
              <ThumbsDown className="h-4 w-4" />
              {currentPost.reactions.dislikes}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
