import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextRequest, NextResponse } from "next/server"
import type { Session } from "next-auth"

// Função para obter sessão autenticada
export async function getAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

// Função para obter sessão com garantia de autenticação
export async function requireAuthSession(): Promise<Session> {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user || !session.user.id) {
    throw new Error("Authentication required")
  }
  
  return session as Session
}

// Helper para validar e retornar erro de autenticação padronizado
export function createAuthError(message: string = "Authentication required") {
  return NextResponse.json(
    { error: message }, 
    { status: 401 }
  )
}

// Helper para validar e retornar erro de autorização padronizado
export function createForbiddenError(message: string = "Not authorized") {
  return NextResponse.json(
    { error: message }, 
    { status: 403 }
  )
}

// Helper para validar e retornar erro de validação padronizado
export function createValidationError(message: string) {
  return NextResponse.json(
    { error: message }, 
    { status: 400 }
  )
}

// Helper para validar e retornar erro de não encontrado padronizado
export function createNotFoundError(message: string = "Resource not found") {
  return NextResponse.json(
    { error: message }, 
    { status: 404 }
  )
}

// Helper para retornar erro interno padronizado
export function createInternalError(message: string = "Internal server error") {
  return NextResponse.json(
    { error: message }, 
    { status: 500 }
  )
}
