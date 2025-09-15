"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { PostWithStats } from "@/services/post.service"
import { useReactions } from "@/hooks/use-reactions"
import { usePosts } from "@/hooks/use-posts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, MessageCircle, User, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: PostWithStats
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter()
  const { addPostReaction, removePostReaction } = useReactions()
  const { fetchPosts } = usePosts()
  const [isReacting, setIsReacting] = useState(false)

  const handleReaction = async (type: "LIKE" | "DISLIKE") => {
    if (isReacting) return

    setIsReacting(true)
    try {
      if (post.userReaction === type) {
        await removePostReaction(post.id)
      } else {
        await addPostReaction(post.id, type)
      }
      await fetchPosts()
    } catch (error) {
      console.error("Reaction error:", error)
    } finally {
      setIsReacting(false)
    }
  }

  const handlePostClick = () => {
    router.push(`/posts/${post.id}`)
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
            <p className="text-sm font-medium">{post.owner.username}</p>
            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye className="h-3 w-3" />
            {post.views}
          </div>
        </div>
      </CardHeader>
      <CardContent onClick={handlePostClick}>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.content}</p>

        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction("LIKE")}
            disabled={isReacting}
            className={cn("gap-1", post.userReaction === "LIKE" && "text-blue-600 bg-blue-50")}
          >
            <ThumbsUp className="h-4 w-4" />
            {post.reactions.likes}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction("DISLIKE")}
            disabled={isReacting}
            className={cn("gap-1", post.userReaction === "DISLIKE" && "text-red-600 bg-red-50")}
          >
            <ThumbsDown className="h-4 w-4" />
            {post.reactions.dislikes}
          </Button>

          <Button variant="ghost" size="sm" className="gap-1">
            <MessageCircle className="h-4 w-4" />
            {post._count.comments}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
