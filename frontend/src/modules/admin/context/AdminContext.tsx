import { type ReactNode, useCallback, useMemo, useState } from "react"
import type { UserResponse } from "@/api/services/user/user-types.ts"
import { AdminContext } from "./admin-context-types.ts"

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserResponse[]>([])

  const updateUser = useCallback(
    (userId: string, changes: Partial<UserResponse>) =>
      setUsers((current) =>
        current.map((user) =>
          user.id === userId ? { ...user, ...changes } : user
        )
      ),
    []
  )

  const removeUser = useCallback(
    (userId: string) =>
      setUsers((current) => current.filter((user) => user.id !== userId)),
    []
  )

  const value = useMemo(
    () => ({ users, setUsers, updateUser, removeUser }),
    [users, updateUser, removeUser]
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
