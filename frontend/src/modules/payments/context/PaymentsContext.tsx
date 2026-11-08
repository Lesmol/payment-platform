import { type ReactNode, useMemo, useState } from "react"
import type { PaymentResponse } from "@/api/services/payment/payment-types.ts"
import { PaymentsContext } from "./payments-context-types.ts"

export function PaymentsProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<PaymentResponse[]>([])
  const [allPayments, setAllPayments] = useState<PaymentResponse[]>([])

  const value = useMemo(
    () => ({ payments, allPayments, setPayments, setAllPayments }),
    [payments, allPayments]
  )

  return (
    <PaymentsContext.Provider value={value}>
      {children}
    </PaymentsContext.Provider>
  )
}
