"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export interface RegisterData {
  username: string
  password: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error("Invalid credentials")
      }

      return result
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Registration failed")
      }

      // After successful registration, log the user in
      return await login(data.username, data.password)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => signOut({ callbackUrl: "/login" })

  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === "loading" || isLoading,
    login,
    register,
    logout,
  }
}
