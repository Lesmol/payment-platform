import { z } from "zod"

export const LoginFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

export type LoginValues = z.infer<typeof LoginFormSchema>
