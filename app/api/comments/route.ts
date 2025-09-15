import { NextRequest } from "next/server"
import { CommentController } from "@/controllers/comment.controller"

export async function GET(request: NextRequest) {
  return CommentController.getAll(request)
}

export async function POST(request: NextRequest) {
  return CommentController.create(request)
}
