import { useContext } from "react"
import { AccountsContext } from "../context/accounts-context-types.ts"

export function useAccounts() {
  const context = useContext(AccountsContext)

  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountsProvider")
  }

  return context
}
