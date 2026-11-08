import { z } from "zod"

export const SinglePaymentFormSchema = z.object({
  fromAccountId: z.string().min(1, "Choose an account"),
  bank: z.string().min(1, "Choose a bank"),
  toAccountNumber: z
    .string()
    .regex(/^\d{6,16}$/, "Enter a valid account number (6 to 16 digits)"),
  amount: z.coerce
    .number({ message: "Enter an amount" })
    .positive("Amount must be greater than zero"),
  paymentType: z.string().min(1, "Choose a payment type"),
})

export type SinglePaymentFormInput = z.input<typeof SinglePaymentFormSchema>
export type SinglePaymentFormValues = z.output<typeof SinglePaymentFormSchema>
