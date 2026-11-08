import { createContext } from "react"
import type { AccountResponse } from "@/api/services/account/account-types.ts"

export type AccountsContextState = {
  accounts: AccountResponse[]
  setAccounts: (accounts: AccountResponse[]) => void
}

export const AccountsContext = createContext<AccountsContextState | undefined>(
  undefined
)
