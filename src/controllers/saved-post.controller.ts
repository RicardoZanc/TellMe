import { SavedPostService } from "@/services/saved-post.service"
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerAuthSession } from "@/lib/auth"

export class SavedPostController {
  static async savePost(req: NextApiRequest, res: NextApiResponse) {
    try {
      const session = await getServerAuthSession({ req, res })
      if (!session) {
        return res.status(401).json({ error: "Authentication required" })
      }

      const { postId } = req.query

      if (typeof postId !== "string") {
        return res.status(400).json({ error: "Invalid post ID" })
      }

      const savedPost = await SavedPostService.savePost(session.user.id, postId)
      return res.status(201).json({ savedPost })
    } catch (error) {
      console.error("Save post error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  static async unsavePost(req: NextApiRequest, res: NextApiResponse) {
    try {
      const session = await getServerAuthSession({ req, res })
      if (!session) {
        return res.status(401).json({ error: "Authentication required" })
      }

      const { postId } = req.query

      if (typeof postId !== "string") {
        return res.status(400).json({ error: "Invalid post ID" })
      }

      await SavedPostService.unsavePost(session.user.id, postId)
      return res.status(200).json({ message: "Post unsaved successfully" })
    } catch (error) {
      console.error("Unsave post error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  static async getSavedPosts(req: NextApiRequest, res: NextApiResponse) {
    try {
      const session = await getServerAuthSession({ req, res })
      if (!session) {
        return res.status(401).json({ error: "Authentication required" })
      }

      const savedPosts = await SavedPostService.getSavedPosts(session.user.id)
      return res.status(200).json({ savedPosts })
    } catch (error) {
      console.error("Get saved posts error:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
}
