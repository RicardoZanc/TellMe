import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { User } from "@prisma/client"

export interface CreateUserData {
  username: string
  password: string
}

export interface LoginData {
  username: string
  password: string
}

export class UserService {
  // Factory pattern for creating users with default values
  static async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    return prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
      },
    })
  }

  static async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    })
  }

  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword)
  }

  static async login(loginData: LoginData): Promise<User | null> {
    const user = await this.findByUsername(loginData.username)
    if (!user) return null

    const isValidPassword = await this.validatePassword(loginData.password, user.password)
    if (!isValidPassword) return null

    return user
  }

  static async getUserStats(userId: string) {
    const [postsCount, commentsCount] = await Promise.all([
      prisma.post.count({ where: { ownerId: userId } }),
      prisma.comment.count({ where: { ownerId: userId } }),
    ])

    return {
      postsCount,
      commentsCount,
    }
  }
}
