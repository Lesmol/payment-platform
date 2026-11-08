import { z } from "zod"
import { ROLES } from "@/api/services/user/user-types.ts"

export const BlockUserRequestSchema = z.object({
  blocked: z.boolean(),
})

export const ChangeRoleRequestSchema = z.object({
  role: z.enum(ROLES),
})

export const InviteUserRequestSchema = z.object({
  email: z.string().min(1),
  role: z.enum(ROLES),
})
