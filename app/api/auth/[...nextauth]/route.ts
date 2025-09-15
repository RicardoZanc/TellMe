import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("[v0] Missing credentials")
          return null
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          })

          if (!user) {
            console.log("[v0] User not found:", credentials.username)
            return null
          }

          // Verify password using bcrypt
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            console.log("[v0] Invalid password for user:", credentials.username)
            return null
          }

          console.log("[v0] Authentication successful for user:", credentials.username)
          return {
            id: user.id.toString(),
            name: user.username,
            email: user.email || `${user.username}@example.com`,
          }
        } catch (error) {
          console.error("[v0] Authentication error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        console.log("[v0] JWT callback - storing user ID:", user.id)
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
        console.log("[v0] Session callback - user ID:", session.user.id)
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-12345",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
