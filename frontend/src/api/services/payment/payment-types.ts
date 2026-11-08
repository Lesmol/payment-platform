import { z } from "zod"
import type { SinglePaymentRequestSchema } from "@/api/services/payment/payment-request-schema.ts"
import type {
  BulkPaymentResponseSchema,
  BulkProgressResponseSchema,
  PaymentResponseSchema,
} from "@/api/services/payment/payment-response-schema.ts"

export type SinglePaymentRequest = z.infer<typeof SinglePaymentRequestSchema>
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>
export type BulkPaymentResponse = z.infer<typeof BulkPaymentResponseSchema>
export type BulkProgressResponse = z.infer<typeof BulkProgressResponseSchema>
export type PaymentStatus = PaymentResponse["status"]
