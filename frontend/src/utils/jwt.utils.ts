import type { Role } from "@/api/services/user/user-types.ts"

interface Claims {
  sub?: string
  email?: string
  preferred_username?: string
  realm_access?: { roles?: string[] }
}

export interface Session {
  userId: string
  email: string
  role: Role
}

export const JwtUtils = {
  decodeClaims(token: string): Claims {
    const payload = token.split(".")[1]
    if (!payload) return {}
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
  },

  toSession(token: string): Session {
    const claims = JwtUtils.decodeClaims(token)
    const roles = claims.realm_access?.roles ?? []
    return {
      userId: claims.sub ?? "",
      email: claims.email ?? claims.preferred_username ?? "",
      role: roles.includes("admin") ? "admin" : "customer",
    }
  },

  encodeFake(claims: Claims): string {
    const encode = (value: object) =>
      btoa(JSON.stringify(value)).replace(/=+$/, "")
    return `${encode({ alg: "none", typ: "JWT" })}.${encode(claims)}.mock`
  },
}
