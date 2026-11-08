import { BrowserRouter } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner.tsx"
import { AuthProvider } from "@/context/AuthContext.tsx"
import { AccountsProvider } from "@/modules/accounts/context/AccountsContext.tsx"
import { PaymentsProvider } from "@/modules/payments/context/PaymentsContext.tsx"
import { AdminProvider } from "@/modules/admin/context/AdminContext.tsx"
import { AppRouter } from "@/AppRouter.tsx"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccountsProvider>
          <PaymentsProvider>
            <AdminProvider>
              <AppRouter />
              <Toaster />
            </AdminProvider>
          </PaymentsProvider>
        </AccountsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
