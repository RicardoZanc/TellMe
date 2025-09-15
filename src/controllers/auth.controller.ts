import { UserService, type CreateUserData, type LoginData } from "@/services/user.service"
import type { NextApiRequest, NextApiResponse } from "next"

export class AuthController {
  static async register(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { username, password }: CreateUserData = req.body

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" })
      }

      // Check if user already exists
      const existingUser = await UserService.findByUsername(username)
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" })
      }

      const user = await UserService.create({ username, password })

      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user

      return res.status(201).json({ user: userWithoutPassword })
    } catch (error) {
      console.error("Registration error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  static async login(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { username, password }: LoginData = req.body

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" })
      }

      const user = await UserService.login({ username, password })
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Don't return password in response
      const { password: _, ...userWithoutPassword } = user

      return res.status(200).json({ user: userWithoutPassword })
    } catch (error) {
      console.error("Login error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
}
