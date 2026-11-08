import { z } from "zod"

export const PaymentResponseSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  fromAccountId: z.string(),
  toAccountNumber: z.string(),
  branchCode: z.string(),
  amount: z.number(),
  currency: z.string(),
  paymentType: z.string(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]),
  batchId: z.string().nullable(),
  createdAt: z.string(),
})

export const BulkPaymentResponseSchema = z.object({
  batchId: z.string(),
  totalRows: z.number(),
  validRows: z.number(),
  errors: z.array(
    z.object({
      row: z.number(),
      field: z.string(),
      message: z.string(),
    })
  ),
})

export const BulkProgressResponseSchema = z.object({
  batchId: z.string(),
  total: z.number(),
  processed: z.number(),
  failed: z.number(),
  status: z.enum(["PROCESSING", "COMPLETED"]),
})
