import { z } from "zod"
import type {
  LoginRequestSchema,
  RefreshRequestSchema,
} from "@/api/services/login/login-request-schema.ts"
import type { LoginResponseSchema } from "@/api/services/login/login-response-schema.ts"

export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type SignUpRequest = LoginRequest
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
