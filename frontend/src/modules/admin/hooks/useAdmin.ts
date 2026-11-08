import { useContext } from "react"
import { AdminContext } from "../context/admin-context-types.ts"

export function useAdmin() {
  const context = useContext(AdminContext)

  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }

  return context
}
