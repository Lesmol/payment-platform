import { z } from "zod"
import { ROLES, USER_STATUSES } from "@/api/services/user/user-types.ts"

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(ROLES),
  status: z.enum(USER_STATUSES),
  createdAt: z.string(),
})
