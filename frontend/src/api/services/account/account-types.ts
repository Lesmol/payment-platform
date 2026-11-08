import { z } from "zod"
import type {
  AccountResponseSchema,
  AccountTransactionResponseSchema,
} from "@/api/services/account/account-response-schema.ts"

export type AccountResponse = z.infer<typeof AccountResponseSchema>
export type AccountTransactionResponse = z.infer<
  typeof AccountTransactionResponseSchema
>
