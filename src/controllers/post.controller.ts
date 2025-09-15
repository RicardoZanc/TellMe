import { PostService, type CreatePostData, type UpdatePostData } from "@/services/post.service"
import { NextRequest, NextResponse } from "next/server"
import { 
  getAuthSession, 
  requireAuthSession,
  createAuthError,
  createValidationError,
  createNotFoundError,
  createForbiddenError,
  createInternalError
} from "@/lib/auth"

export class PostController {
  static async create(request: NextRequest) {
    try {
      const session = await requireAuthSession()
      const { title, content } = await request.json()

      if (!title || !content) {
        return createValidationError("Title and content are required")
      }

      const post = await PostService.create({
        title,
        content,
        ownerId: session.user.id,
      })

      return NextResponse.json({ post }, { status: 201 })
    } catch (error) {
      console.error("Create post error:", error)
      if (error instanceof Error && error.message === "Authentication required") {
        return createAuthError()
      }
      return createInternalError()
    }
  }

  static async getAll(request: NextRequest) {
    try {
      const session = await getAuthSession()
      const userId = session?.user?.id

      const posts = await PostService.findAll(userId)
      return NextResponse.json({ posts })
    } catch (error) {
      console.error("Get posts error:", error)
      return createInternalError()
    }
  }

  static async getById(request: NextRequest, params: { id: string }) {
    try {
      const { id } = params

      if (!id) {
        return NextResponse.json(
          { error: "Invalid post ID" }, 
          { status: 400 }
        )
      }

      const post = await PostService.findById(id)
      if (!post) {
        return NextResponse.json(
          { error: "Post not found" }, 
          { status: 404 }
        )
      }

      // Increment views
      await PostService.incrementViews(id)

      return NextResponse.json({ post })
    } catch (error) {
      console.error("Get post error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  static async update(request: NextRequest, params: { id: string }) {
    try {
      const session = await requireAuthSession()
      const { id } = params
      const { title, content } = await request.json()

      if (!id) {
        return createValidationError("Invalid post ID")
      }

      // Check if user owns the post
      const existingPost = await PostService.findById(id)
      if (!existingPost) {
        return createNotFoundError("Post not found")
      }

      if (existingPost.ownerId !== session.user.id) {
        return createForbiddenError("Not authorized to edit this post")
      }

      const post = await PostService.update(id, { title, content })
      return NextResponse.json({ post })
    } catch (error) {
      console.error("Update post error:", error)
      if (error instanceof Error && error.message === "Authentication required") {
        return createAuthError()
      }
      return createInternalError()
    }
  }

  static async delete(request: NextRequest, params: { id: string }) {
    try {
      const session = await requireAuthSession()
      const { id } = params

      if (!id) {
        return createValidationError("Invalid post ID")
      }

      // Check if user owns the post
      const existingPost = await PostService.findById(id)
      if (!existingPost) {
        return createNotFoundError("Post not found")
      }

      if (existingPost.ownerId !== session.user.id) {
        return createForbiddenError("Not authorized to delete this post")
      }

      await PostService.delete(id)
      return NextResponse.json({ message: "Post deleted successfully" })
    } catch (error) {
      console.error("Delete post error:", error)
      if (error instanceof Error && error.message === "Authentication required") {
        return createAuthError()
      }
      return createInternalError()
    }
  }
}
