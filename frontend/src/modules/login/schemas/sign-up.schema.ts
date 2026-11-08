import { z } from "zod"

export const SignUpFormSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  })

export type SignUpValues = z.infer<typeof SignUpFormSchema>
