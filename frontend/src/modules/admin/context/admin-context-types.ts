import { createContext } from "react"
import type { UserResponse } from "@/api/services/user/user-types.ts"

export type AdminContextState = {
  users: UserResponse[]
  setUsers: (users: UserResponse[]) => void
  updateUser: (userId: string, changes: Partial<UserResponse>) => void
  removeUser: (userId: string) => void
}

export const AdminContext = createContext<AdminContextState | undefined>(
  undefined
)
