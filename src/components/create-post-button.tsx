"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

export function CreatePostButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Sending POST request to /api/posts") // Debug log

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      })

      console.log("[v0] Response status:", response.status) // Debug log

      if (!response.ok) {
        const errorData = await response.json()
        console.log("[v0] Error response:", errorData) // Debug log
        throw new Error(errorData.error || "Erro ao criar post")
      }

      const data = await response.json()
      console.log("[v0] Post created successfully:", data) // Debug log

      setIsOpen(false)
      setTitle("")
      setContent("")
      router.push(`/posts/${data.post.id}`)
      router.refresh() // Force refresh to show new post
    } catch (error) {
      console.error("[v0] Erro ao criar post:", error)
      setError(error instanceof Error ? error.message : "Erro ao criar post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Post</DialogTitle>
          <DialogDescription>Crie um novo post para compartilhar com a comunidade</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Título do post" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea
            placeholder="Conteúdo do post"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Postando..." : "Postar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
