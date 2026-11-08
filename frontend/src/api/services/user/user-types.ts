import { z } from "zod"
import type {
  BlockUserRequestSchema,
  ChangeRoleRequestSchema,
  InviteUserRequestSchema,
} from "@/api/services/user/user-request-schema.ts"
import type { UserResponseSchema } from "@/api/services/user/user-response-schema.ts"

export const ROLES = ["customer", "admin"] as const
export const USER_STATUSES = ["ACTIVE", "BLOCKED", "INVITED"] as const

export type Role = (typeof ROLES)[number]
export type UserStatus = (typeof USER_STATUSES)[number]

export type BlockUserRequest = z.infer<typeof BlockUserRequestSchema>
export type ChangeRoleRequest = z.infer<typeof ChangeRoleRequestSchema>
export type InviteUserRequest = z.infer<typeof InviteUserRequestSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
