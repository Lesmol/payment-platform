import { z } from "zod"

export const SinglePaymentRequestSchema = z.object({
  fromAccountId: z.string().min(1),
  toAccountNumber: z.string().min(1),
  branchCode: z.string().min(1),
  amount: z.number().positive(),
  paymentType: z.string().min(1),
})
