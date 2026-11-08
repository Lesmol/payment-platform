import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { AuthContext } from "@/context/auth-context-types.ts"
import { tokenStorage } from "@/api/token-storage.ts"
import { JwtUtils, type Session } from "@/utils/jwt.utils.ts"

function readSession(): Session | null {
  const accessToken = tokenStorage.accessToken
  if (!accessToken || !tokenStorage.refreshToken) return null
  return JwtUtils.toSession(accessToken)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession)

  const login = useCallback(
    (accessToken: string, refreshToken: string, expiresIn: number) => {
      tokenStorage.save(accessToken, refreshToken, expiresIn)
      setSession(JwtUtils.toSession(accessToken))
    },
    []
  )

  const logout = useCallback(() => {
    tokenStorage.clear()
    setSession(null)
  }, [])

  useEffect(() => {
    tokenStorage.onExpired(logout)
  }, [logout])

  const value = useMemo(
    () => ({ session, isAuthenticated: session !== null, login, logout }),
    [session, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
