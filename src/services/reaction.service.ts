import { prisma } from "@/lib/prisma"
import type { PostReaction, CommentReaction, ReactionType } from "@prisma/client"

export interface CreateReactionData {
  userId: string
  type: ReactionType
}

export class ReactionService {
  // Post Reactions
  static async addPostReaction(postId: string, reactionData: CreateReactionData): Promise<PostReaction> {
    // Remove existing reaction if any (ensures uniqueness)
    await this.removePostReaction(postId, reactionData.userId)

    return prisma.postReaction.create({
      data: {
        postId,
        userId: reactionData.userId,
        type: reactionData.type,
      },
    })
  }

  static async removePostReaction(postId: string, userId: string): Promise<void> {
    await prisma.postReaction.deleteMany({
      where: {
        postId,
        userId,
      },
    })
  }

  static async getPostReaction(postId: string, userId: string): Promise<PostReaction | null> {
    return prisma.postReaction.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    })
  }

  static async getPostReactionStats(postId: string) {
    const reactions = await prisma.postReaction.findMany({
      where: { postId },
    })

    const likes = reactions.filter((r) => r.type === "LIKE").length
    const dislikes = reactions.filter((r) => r.type === "DISLIKE").length

    return { likes, dislikes }
  }

  // Comment Reactions
  static async addCommentReaction(commentId: string, reactionData: CreateReactionData): Promise<CommentReaction> {
    // Remove existing reaction if any (ensures uniqueness)
    await this.removeCommentReaction(commentId, reactionData.userId)

    return prisma.commentReaction.create({
      data: {
        commentId,
        userId: reactionData.userId,
        type: reactionData.type,
      },
    })
  }

  static async removeCommentReaction(commentId: string, userId: string): Promise<void> {
    await prisma.commentReaction.deleteMany({
      where: {
        commentId,
        userId,
      },
    })
  }

  static async getCommentReaction(commentId: string, userId: string): Promise<CommentReaction | null> {
    return prisma.commentReaction.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    })
  }

  static async getCommentReactionStats(commentId: string) {
    const reactions = await prisma.commentReaction.findMany({
      where: { commentId },
    })

    const likes = reactions.filter((r) => r.type === "LIKE").length
    const dislikes = reactions.filter((r) => r.type === "DISLIKE").length

    return { likes, dislikes }
  }
}
