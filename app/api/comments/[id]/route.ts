import { NextRequest } from "next/server"
import { CommentController } from "@/controllers/comment.controller"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return CommentController.getById(request, params)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return CommentController.update(request, params)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return CommentController.delete(request, params)
}
