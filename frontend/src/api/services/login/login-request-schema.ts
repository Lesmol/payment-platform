import { z } from "zod"

export const LoginRequestSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
})

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
})
