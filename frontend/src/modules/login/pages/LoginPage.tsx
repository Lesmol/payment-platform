import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Button } from "@/components/ui/button.tsx"
import { useAsyncAction } from "@/hooks/useAsyncAction.ts"
import { useAuth } from "@/hooks/useAuth.ts"
import { useServices } from "@/hooks/useServices.ts"
import {
  LoginFormSchema,
  type LoginValues,
} from "@/modules/login/schemas/login.schema.ts"
import { ROUTES } from "@/routes.ts"

const LoginPage = () => {
  const navigate = useNavigate()
  const { loginService } = useServices()
  const { login } = useAuth()
  const [errorMessage, setErrorMessage] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(LoginFormSchema) })

  const loginAction = useAsyncAction(async (values: LoginValues) => {
    setErrorMessage("")

    const response = await loginService.login(values)

    if (response.status === "ok") {
      login(
        response.data.access_token,
        response.data.refresh_token,
        response.data.expires_in
      )
      navigate(ROUTES.ACCOUNTS, { replace: true })
    } else {
      setErrorMessage(response.data.description || response.data.message)
    }
  })

  const onSubmit = (values: LoginValues) => {
    loginAction.execute(values).catch(() => {
      setErrorMessage(
        "Unable to connect. Please check your network and try again."
      )
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use your email and password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={loginAction.isPending}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  disabled={loginAction.isPending}
                  {...register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>

              {errorMessage && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive">
                  {errorMessage}
                </div>
              )}

              <Button type="submit" disabled={loginAction.isPending}>
                {loginAction.isPending ? "Signing in…" : "Sign in"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                No account?{" "}
                <Link
                  to={ROUTES.SIGNUP}
                  className="text-foreground underline underline-offset-4"
                >
                  Sign up
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
