import { prisma } from "@/lib/prisma"
import type { Comment, CommentReaction, ReactionType } from "@prisma/client"

export interface CreateCommentData {
  content: string
  ownerId: string
  postId: string
  parentCommentId?: string
}

export interface UpdateCommentData {
  content: string
}

export interface CommentWithStats extends Comment {
  owner: {
    id: string
    username: string
  }
  reactions: {
    likes: number
    dislikes: number
  }
  userReaction?: ReactionType | null
  replies?: CommentWithStats[]
}

export class CommentService {
  // Factory pattern for creating comments with default values
  static async create(commentData: CreateCommentData): Promise<Comment> {
    return prisma.comment.create({
      data: {
        content: commentData.content,
        ownerId: commentData.ownerId,
        postId: commentData.postId,
        parentCommentId: commentData.parentCommentId || null,
      },
    })
  }

  static async findById(id: string): Promise<Comment | null> {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true },
        },
      },
    })
  }

  static async findByPostId(postId: string, userId?: string): Promise<CommentWithStats[]> {
    // Get all comments for the post (both top-level and replies)
    const allComments = await prisma.comment.findMany({
      where: { postId },
      include: {
        owner: {
          select: { id: true, username: true },
        },
        commentReactions: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // Build hierarchical structure
    const commentMap = new Map<string, any>()
    const topLevelComments: any[] = []

    // First pass: create all comments with empty replies array
    allComments.forEach(comment => {
      const commentWithStats = {
        ...comment,
        replies: []
      }
      commentMap.set(comment.id, commentWithStats)
    })

    // Second pass: organize into hierarchy
    allComments.forEach(comment => {
      const commentWithStats = commentMap.get(comment.id)!
      
      if (comment.parentCommentId) {
        // This is a reply, add it to parent's replies
        const parent = commentMap.get(comment.parentCommentId)
        if (parent) {
          parent.replies.push(commentWithStats)
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(commentWithStats)
      }
    })

    // Sort top-level comments by creation date (newest first)
    topLevelComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return topLevelComments.map((comment) => this.mapCommentWithStats(comment, userId))
  }

  private static mapCommentWithStats(comment: any, userId?: string): CommentWithStats {
    const likes = comment.commentReactions.filter((r: CommentReaction) => r.type === "LIKE").length
    const dislikes = comment.commentReactions.filter((r: CommentReaction) => r.type === "DISLIKE").length
    const userReaction = userId
      ? comment.commentReactions.find((r: CommentReaction) => r.userId === userId)?.type || null
      : null

    return {
      ...comment,
      reactions: { likes, dislikes },
      userReaction,
      replies: comment.replies?.map((reply: any) => this.mapCommentWithStats(reply, userId)),
    }
  }

  static async update(id: string, updateData: UpdateCommentData): Promise<Comment> {
    return prisma.comment.update({
      where: { id },
      data: updateData,
    })
  }

  static async delete(id: string): Promise<void> {
    await prisma.comment.delete({
      where: { id },
    })
  }

  static async getCommentsByUser(userId: string): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { ownerId: userId },
      include: {
        owner: {
          select: { id: true, username: true },
        },
        post: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }
}
