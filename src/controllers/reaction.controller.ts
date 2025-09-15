import { ReactionService } from "@/services/reaction.service"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { ReactionType } from "@prisma/client"

export class ReactionController {
  // Post Reactions
  static async addPostReaction(request: NextRequest, params: { postId: string }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      }

      const { postId } = params
      const { type } = await request.json()

      if (!postId) {
        return NextResponse.json(
          { error: "Invalid post ID" }, 
          { status: 400 }
        )
      }

      if (!type || !["LIKE", "DISLIKE"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid reaction type" }, 
          { status: 400 }
        )
      }

      const reaction = await ReactionService.addPostReaction(postId, {
        userId: session.user.id,
        type: type as ReactionType,
      })

      return NextResponse.json({ reaction }, { status: 201 })
    } catch (error) {
      console.error("Add post reaction error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  static async removePostReaction(request: NextRequest, params: { postId: string }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      }

      const { postId } = params

      if (!postId) {
        return NextResponse.json(
          { error: "Invalid post ID" }, 
          { status: 400 }
        )
      }

      await ReactionService.removePostReaction(postId, session.user.id)

      return NextResponse.json({ message: "Reaction removed successfully" })
    } catch (error) {
      console.error("Remove post reaction error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  // Comment Reactions
  static async addCommentReaction(request: NextRequest, params: { commentId: string }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      }

      const { commentId } = params
      const { type } = await request.json()

      if (!commentId) {
        return NextResponse.json(
          { error: "Invalid comment ID" }, 
          { status: 400 }
        )
      }

      if (!type || !["LIKE", "DISLIKE"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid reaction type" }, 
          { status: 400 }
        )
      }

      const reaction = await ReactionService.addCommentReaction(commentId, {
        userId: session.user.id,
        type: type as ReactionType,
      })

      return NextResponse.json({ reaction }, { status: 201 })
    } catch (error) {
      console.error("Add comment reaction error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  static async removeCommentReaction(request: NextRequest, params: { commentId: string }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      }

      const { commentId } = params

      if (!commentId) {
        return NextResponse.json(
          { error: "Invalid comment ID" }, 
          { status: 400 }
        )
      }

      await ReactionService.removeCommentReaction(commentId, session.user.id)

      return NextResponse.json({ message: "Reaction removed successfully" })
    } catch (error) {
      console.error("Remove comment reaction error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  // Toggle Reactions (More convenient for UI)
  static async togglePostReaction(request: NextRequest, params: { postId: string }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      }

      const { postId } = params
      const { type } = await request.json()

      if (!postId) {
        return NextResponse.json(
          { error: "Invalid post ID" }, 
          { status: 400 }
        )
      }

      if (!type || !["LIKE", "DISLIKE"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid reaction type" }, 
          { status: 400 }
        )
      }

      // Check existing reaction and toggle
      const existingReaction = await ReactionService.getPostReaction(postId, session.user.id)
      
      if (existingReaction && existingReaction.type === type) {
        await ReactionService.removePostReaction(postId, session.user.id)
        const result = { action: 'removed', type }
        return NextResponse.json({ result })
      } else {
        await ReactionService.addPostReaction(postId, { userId: session.user.id, type: type as ReactionType })
        const result = { action: 'added', type }
        return NextResponse.json({ result })
      }
    } catch (error) {
      console.error("Toggle post reaction error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }

  static async toggleCommentReaction(request: NextRequest, params: { commentId: string }) {
    try {
      const session = await getServerSession(authOptions)
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Authentication required" }, 
          { status: 401 }
        )
      }

      const { commentId } = params
      const { type } = await request.json()

      if (!commentId) {
        return NextResponse.json(
          { error: "Invalid comment ID" }, 
          { status: 400 }
        )
      }

      if (!type || !["LIKE", "DISLIKE"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid reaction type" }, 
          { status: 400 }
        )
      }

      // Check existing reaction and toggle
      const existingReaction = await ReactionService.getCommentReaction(commentId, session.user.id)
      
      if (existingReaction && existingReaction.type === type) {
        await ReactionService.removeCommentReaction(commentId, session.user.id)
        const result = { action: 'removed', type }
        return NextResponse.json({ result })
      } else {
        await ReactionService.addCommentReaction(commentId, { userId: session.user.id, type: type as ReactionType })
        const result = { action: 'added', type }
        return NextResponse.json({ result })
      }
    } catch (error) {
      console.error("Toggle comment reaction error:", error)
      return NextResponse.json(
        { error: "Internal server error" }, 
        { status: 500 }
      )
    }
  }
}
