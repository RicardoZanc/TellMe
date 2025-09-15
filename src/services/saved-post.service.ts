import { prisma } from "@/lib/prisma"
import type { SavedPost } from "@prisma/client"

export class SavedPostService {
  static async savePost(userId: string, postId: string): Promise<SavedPost> {
    return prisma.savedPost.create({
      data: {
        userId,
        postId,
      },
    })
  }

  static async unsavePost(userId: string, postId: string): Promise<void> {
    await prisma.savedPost.deleteMany({
      where: {
        userId,
        postId,
      },
    })
  }

  static async isPostSaved(userId: string, postId: string): Promise<boolean> {
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    })

    return !!savedPost
  }

  static async getSavedPosts(userId: string) {
    return prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            owner: {
              select: { id: true, username: true },
            },
            _count: {
              select: {
                comments: true,
                postReactions: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }
}
