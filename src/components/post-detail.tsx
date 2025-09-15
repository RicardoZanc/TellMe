"use client"

import type { Post } from "@prisma/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PostDetailProps {
  post: Post & {
    owner: {
      id: string
      username: string
    }
  }
}

export function PostDetail({ post }: PostDetailProps) {
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
              <p className="text-sm font-medium">{post.owner.username}</p>
              <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="h-3 w-3" />
              {post.views}
            </div>
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
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>
      </CardContent>
    </Card>
  )
} 