import { useContext } from "react"
import { PaymentsContext } from "../context/payments-context-types.ts"

export function usePayments() {
  const context = useContext(PaymentsContext)

  if (context === undefined) {
    throw new Error("usePayments must be used within a PaymentsProvider")
  }

  return context
}
