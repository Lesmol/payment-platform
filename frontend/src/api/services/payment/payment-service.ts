import { z } from "zod"
import { HttpService, type ServiceResult } from "../HttpService"
import { SinglePaymentRequestSchema } from "@/api/services/payment/payment-request-schema.ts"
import {
  BulkPaymentResponseSchema,
  BulkProgressResponseSchema,
  PaymentResponseSchema,
} from "@/api/services/payment/payment-response-schema.ts"
import type {
  BulkPaymentResponse,
  BulkProgressResponse,
  PaymentResponse,
  SinglePaymentRequest,
} from "@/api/services/payment/payment-types.ts"
import { PAYMENT_ENDPOINTS } from "@/api/services/payment/payment-endpoints.ts"
import { ENDPOINTS } from "@/api/api-paths.ts"

class PaymentService extends HttpService {
  private basePath = ENDPOINTS.PAYMENT

  async singlePayment(request: SinglePaymentRequest): Promise<ServiceResult> {
    const body = SinglePaymentRequestSchema.parse(request)
    return this.post(this.path(PAYMENT_ENDPOINTS.SINGLE_PAYMENT), body)
  }

  async bulkPayment(
    file: File,
    sourceAccountId: string
  ): Promise<ServiceResult<BulkPaymentResponse>> {
    const form = new FormData()
    form.append("file", file)
    form.append("sourceAccountId", sourceAccountId)
    return this.post(
      this.path(PAYMENT_ENDPOINTS.BULK_PAYMENT),
      form,
      BulkPaymentResponseSchema
    )
  }

  async getBulkProgress(
    batchId: string
  ): Promise<ServiceResult<BulkProgressResponse>> {
    return this.get(
      this.path(PAYMENT_ENDPOINTS.BULK_PROGRESS.replace("{batchId}", batchId)),
      BulkProgressResponseSchema
    )
  }

  async getPayments(): Promise<ServiceResult<PaymentResponse[]>> {
    return this.get(this.path(), z.array(PaymentResponseSchema))
  }

  async getAllPayments(): Promise<ServiceResult<PaymentResponse[]>> {
    return this.get(
      this.path(PAYMENT_ENDPOINTS.GET_ALL_PAYMENTS),
      z.array(PaymentResponseSchema)
    )
  }

  path(endpoint?: string) {
    return endpoint ? `${this.basePath}/${endpoint}` : this.basePath
  }
}

export const paymentService = new PaymentService()
