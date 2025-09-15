import { NextRequest } from "next/server"
import { CommentController } from "@/controllers/comment.controller"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Renomeia id para postId para o CommentController
  const postParams = { postId: params.id }
  return CommentController.getByPostId(request, postParams)
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // Adiciona postId ao body da requisição
  const originalBody = await request.json()
  const newRequest = new Request(request, {
    body: JSON.stringify({
      ...originalBody,
      postId: params.id
    })
  }) as NextRequest
  
  return CommentController.create(newRequest)
}
