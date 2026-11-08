import { z } from "zod"

export const AccountResponseSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  accountNumber: z.string(),
  accountType: z.string(),
  currency: z.string(),
  balance: z.number(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const AccountTransactionResponseSchema = z.object({
  id: z.number(),
  accountId: z.string(),
  paymentId: z.string(),
  type: z.enum(["DEBIT", "CREDIT"]),
  amount: z.number(),
  balanceAfter: z.number(),
  createdAt: z.string(),
})
