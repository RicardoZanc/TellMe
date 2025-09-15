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
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentCommentId: null, // Only top-level comments
      },
      include: {
        owner: {
          select: { id: true, username: true },
        },
        commentReactions: true,
        replies: {
          include: {
            owner: {
              select: { id: true, username: true },
            },
            commentReactions: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return comments.map((comment) => this.mapCommentWithStats(comment, userId))
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
