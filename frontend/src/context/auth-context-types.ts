import { createContext } from "react"
import type { Session } from "@/utils/jwt.utils.ts"

export type AuthContextState = {
  session: Session | null
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string, expiresIn: number) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextState | undefined>(
  undefined
)
