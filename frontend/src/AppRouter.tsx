import { lazy, Suspense } from "react"
import { Routes, Route, Navigate, Outlet } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout.tsx"
import { useAuth } from "@/hooks/useAuth.ts"
import { ROUTES } from "@/routes.ts"

const LoginPage = lazy(() => import("@/modules/login/pages/LoginPage.tsx"))

const SignUpPage = lazy(() => import("@/modules/login/pages/SignUpPage.tsx"))

const AccountsPage = lazy(
  () => import("@/modules/accounts/pages/AccountsPage.tsx")
)

const SinglePaymentPage = lazy(
  () => import("@/modules/payments/pages/SinglePaymentPage.tsx")
)

const BulkPaymentPage = lazy(
  () => import("@/modules/payments/pages/BulkPaymentPage.tsx")
)

const HistoryPage = lazy(
  () => import("@/modules/payments/pages/HistoryPage.tsx")
)

const AdminPaymentsPage = lazy(
  () => import("@/modules/admin/pages/AdminPaymentsPage.tsx")
)

const AdminUsersPage = lazy(
  () => import("@/modules/admin/pages/AdminUsersPage.tsx")
)

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
  return <AppLayout />
}

function AdminRoute() {
  const { session } = useAuth()
  if (session?.role !== "admin")
    return <Navigate to={ROUTES.ACCOUNTS} replace />
  return <Outlet />
}

function PublicRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to={ROUTES.ACCOUNTS} replace />
  return <Outlet />
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.ACCOUNTS} element={<AccountsPage />} />
          <Route path={ROUTES.PAYMENT} element={<SinglePaymentPage />} />
          <Route path={ROUTES.BULK_PAYMENT} element={<BulkPaymentPage />} />
          <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
          <Route element={<AdminRoute />}>
            <Route
              path={ROUTES.ADMIN_PAYMENTS}
              element={<AdminPaymentsPage />}
            />
            <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter
