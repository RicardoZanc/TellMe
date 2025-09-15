import { NextRequest } from "next/server"
import { ReactionController } from "@/controllers/reaction.controller"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return ReactionController.togglePostReaction(request, { postId: params.id })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return ReactionController.removePostReaction(request, { postId: params.id })
} 