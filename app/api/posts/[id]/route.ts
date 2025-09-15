import { NextRequest } from "next/server"
import { PostController } from "@/controllers/post.controller"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return PostController.getById(request, params)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return PostController.update(request, params)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return PostController.delete(request, params)
}
