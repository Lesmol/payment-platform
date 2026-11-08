import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button.tsx"
import { useAuth } from "@/hooks/useAuth.ts"
import { cn } from "@/lib/utils.ts"
import { ROUTES } from "@/routes.ts"

interface NavItem {
  to: string
  label: string
  end?: boolean
}

const CUSTOMER_LINKS: NavItem[] = [
  { to: ROUTES.ACCOUNTS, label: "Accounts", end: true },
  { to: ROUTES.PAYMENT, label: "Make a payment" },
  { to: ROUTES.BULK_PAYMENT, label: "Bulk payments" },
  { to: ROUTES.HISTORY, label: "Payment history" },
]

const ADMIN_LINKS: NavItem[] = [
  { to: ROUTES.ADMIN_PAYMENTS, label: "All payments" },
  { to: ROUTES.ADMIN_USERS, label: "Users" },
]

export function AppLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const links =
    session?.role === "admin"
      ? [...CUSTOMER_LINKS, ...ADMIN_LINKS]
      : CUSTOMER_LINKS

  return (
    <div className="flex min-h-svh">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar p-4">
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent font-medium text-accent-foreground"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border pt-4">
          <p className="truncate text-xs text-muted-foreground">
            {session?.email}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              logout()
              navigate(ROUTES.LOGIN)
            }}
          >
            Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
