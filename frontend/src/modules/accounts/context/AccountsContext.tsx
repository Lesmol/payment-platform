import { type ReactNode, useMemo, useState } from "react"
import type { AccountResponse } from "@/api/services/account/account-types.ts"
import { AccountsContext } from "./accounts-context-types.ts"

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<AccountResponse[]>([])

  const value = useMemo(() => ({ accounts, setAccounts }), [accounts])

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  )
}
