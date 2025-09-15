import { prisma } from "@/lib/prisma"
import type { Post, ReactionType } from "@prisma/client"

export interface CreatePostData {
  title: string
  content: string
  ownerId: string // Reverted to required ownerId only
}

export interface UpdatePostData {
  title?: string
  content?: string
}

export interface PostWithStats extends Post {
  owner: {
    id: string
    username: string
  }
  _count: {
    comments: number
    postReactions: number
  }
  reactions: {
    likes: number
    dislikes: number
  }
  userReaction?: ReactionType | null
}

export class PostService {
  static async create(postData: CreatePostData): Promise<Post> {
    return prisma.post.create({
      data: {
        title: postData.title,
        content: postData.content,
        owner: {
          connect: { id: postData.ownerId },
        },
        views: 0, 
      },
    })
  }

  static async findById(id: string): Promise<Post | null> {
    return prisma.post.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true },
        },
      },
    })
  }

  static async findByIdWithStats(id: string, userId?: string): Promise<PostWithStats | null> {
    const post = await prisma.post.findUnique({
      where: { id },
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
        postReactions: true,
      },
    })

    if (!post) return null

    const likes = post.postReactions.filter((r) => r.type === "LIKE").length
    const dislikes = post.postReactions.filter((r) => r.type === "DISLIKE").length
    const userReaction = userId ? post.postReactions.find((r) => r.userId === userId)?.type || null : null

    return {
      ...post,
      reactions: { likes, dislikes },
      userReaction,
    }
  }

  static async findAll(userId?: string): Promise<PostWithStats[]> {
    const posts = await prisma.post.findMany({
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
        postReactions: true,
      },
      orderBy: [{ createdAt: "desc" }],
    })

    return posts.map((post) => {
      const likes = post.postReactions.filter((r) => r.type === "LIKE").length
      const dislikes = post.postReactions.filter((r) => r.type === "DISLIKE").length
      const userReaction = userId ? post.postReactions.find((r) => r.userId === userId)?.type || null : null

      return {
        ...post,
        reactions: { likes, dislikes },
        userReaction,
      }
    })
  }

  static async update(id: string, updateData: UpdatePostData): Promise<Post> {
    return prisma.post.update({
      where: { id },
      data: updateData,
    })
  }

  static async delete(id: string): Promise<void> {
    await prisma.post.delete({
      where: { id },
    })
  }

  static async incrementViews(id: string): Promise<void> {
    await prisma.post.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    })
  }

  static async getPostsByUser(userId: string): Promise<Post[]> {
    return prisma.post.findMany({
      where: { ownerId: userId },
      include: {
        owner: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }
}
