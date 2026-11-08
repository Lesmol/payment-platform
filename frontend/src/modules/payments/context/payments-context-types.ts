import { createContext } from "react"
import type { PaymentResponse } from "@/api/services/payment/payment-types.ts"

export type PaymentsContextState = {
  payments: PaymentResponse[]
  allPayments: PaymentResponse[]
  setPayments: (payments: PaymentResponse[]) => void
  setAllPayments: (payments: PaymentResponse[]) => void
}

export const PaymentsContext = createContext<PaymentsContextState | undefined>(
  undefined
)
