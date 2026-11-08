import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription } from "@/components/ui/alert.tsx"
import { Button, buttonVariants } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.tsx"
import { Input } from "@/components/ui/input.tsx"
import { useAsyncAction } from "@/hooks/useAsyncAction.ts"
import { useServices } from "@/hooks/useServices.ts"
import {
  SignUpFormSchema,
  type SignUpValues,
} from "@/modules/login/schemas/sign-up.schema.ts"
import { ROUTES } from "@/routes.ts"

const SignUpPage = () => {
  const { loginService } = useServices()
  const [errorMessage, setErrorMessage] = useState("")
  const [isRegistered, setIsRegistered] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({ resolver: zodResolver(SignUpFormSchema) })

  const signUpAction = useAsyncAction(async (values: SignUpValues) => {
    setErrorMessage("")

    const response = await loginService.signUp({
      email: values.email,
      password: values.password,
    })

    if (response.status === "ok") {
      setIsRegistered(true)
    } else {
      setErrorMessage(response.data.description || response.data.message)
    }
  })

  const onSubmit = (values: SignUpValues) => {
    signUpAction.execute(values).catch(() => {
      setErrorMessage(
        "Unable to connect. Please check your network and try again."
      )
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Register with your email address.</CardDescription>
        </CardHeader>
        <CardContent>
          {isRegistered ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Account created. You can sign in now.
                </AlertDescription>
              </Alert>
              <Link
                to={ROUTES.LOGIN}
                className={buttonVariants({ className: "w-full" })}
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    disabled={signUpAction.isPending}
                    {...register("email")}
                  />
                  <FieldError errors={[errors.email]} />
                </Field>
                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    disabled={signUpAction.isPending}
                    {...register("password")}
                  />
                  <FieldError errors={[errors.password]} />
                </Field>
                <Field data-invalid={!!errors.confirm}>
                  <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    disabled={signUpAction.isPending}
                    {...register("confirm")}
                  />
                  <FieldError errors={[errors.confirm]} />
                </Field>

                {errorMessage && (
                  <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive">
                    {errorMessage}
                  </div>
                )}

                <Button type="submit" disabled={signUpAction.isPending}>
                  {signUpAction.isPending ? "Creating…" : "Create account"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already registered?{" "}
                  <Link
                    to={ROUTES.LOGIN}
                    className="text-foreground underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </p>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUpPage
