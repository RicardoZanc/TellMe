import { CommentService, type CreateCommentData, type UpdateCommentData } from "@/services/comment.service"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export class CommentController {
  static async create(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      }

      const { content, postId, parentCommentId } = await request.json()

      if (!content || !postId) {
        return NextResponse.json(
          { error: "Content and postId are required" }, 
          { status: 400 }
        )
      }

      const comment = await CommentService.create({
        content,
        postId,
        parentCommentId,
        ownerId: session.user.id,
      })

      return NextResponse.json({ comment }, { status: 201 })
    } catch (error) {
      console.error("Create comment error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  static async getByPostId(request: NextRequest, params: { postId: string }) {
    try {
      const { postId } = params

      if (!postId) {
        return NextResponse.json(
          { error: "Invalid post ID" }, 
          { status: 400 }
        )
      }

      // Get user session to pass userId to service
      const session = await getServerSession(authOptions)
      const userId = session?.user?.id

      const comments = await CommentService.findByPostId(postId, userId)
      return NextResponse.json({ comments })
    } catch (error) {
      console.error("Get comments by post error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  static async getById(request: NextRequest, params: { id: string }) {
    try {
      const { id } = params

      if (!id) {
        return NextResponse.json(
          { error: "Invalid comment ID" }, 
          { status: 400 }
        )
      }

      const comment = await CommentService.findById(id)
      if (!comment) {
        return NextResponse.json(
          { error: "Comment not found" }, 
          { status: 404 }
        )
      }

      return NextResponse.json({ comment })
    } catch (error) {
      console.error("Get comment error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  static async update(request: NextRequest, params: { id: string }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      }

      const { id } = params
      const { content } = await request.json()

      if (!id) {
        return NextResponse.json(
          { error: "Invalid comment ID" }, 
          { status: 400 }
        )
      }

      if (!content) {
        return NextResponse.json(
          { error: "Content is required" }, 
          { status: 400 }
        )
      }

      // Check if user owns the comment
      const existingComment = await CommentService.findById(id)
      if (!existingComment) {
        return NextResponse.json(
          { error: "Comment not found" }, 
          { status: 404 }
        )
      }

      if (existingComment.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: "Not authorized to edit this comment" }, 
          { status: 403 }
        )
      }

      const comment = await CommentService.update(id, { content })
      return NextResponse.json({ comment })
    } catch (error) {
      console.error("Update comment error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  static async delete(request: NextRequest, params: { id: string }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      }

      const { id } = params

      if (!id) {
        return NextResponse.json(
          { error: "Invalid comment ID" }, 
          { status: 400 }
        )
      }

      // Check if user owns the comment
      const existingComment = await CommentService.findById(id)
      if (!existingComment) {
        return NextResponse.json(
          { error: "Comment not found" }, 
          { status: 404 }
        )
      }

      if (existingComment.ownerId !== session.user.id) {
        return NextResponse.json(
          { error: "Not authorized to delete this comment" }, 
          { status: 403 }
        )
      }

      await CommentService.delete(id)
      return NextResponse.json({ message: "Comment deleted successfully" })
    } catch (error) {
      console.error("Delete comment error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  static async getAll(request: NextRequest) {
    try {
      const comments = await CommentService.findAll()
      return NextResponse.json({ comments })
    } catch (error) {
      console.error("Get all comments error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }
}
