import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader.tsx"
import { StatusBadge } from "@/components/StatusBadge.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.tsx"
import { Input } from "@/components/ui/input.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx"
import {
  ROLES,
  type Role,
  type UserResponse,
} from "@/api/services/user/user-types.ts"
import type { ServiceResult } from "@/api/services/HttpService.ts"
import { useAsyncAction } from "@/hooks/useAsyncAction.ts"
import { useAuth } from "@/hooks/useAuth.ts"
import { useServices } from "@/hooks/useServices.ts"
import { useAdmin } from "@/modules/admin/hooks/useAdmin.ts"
import { formatDate } from "@/lib/format.ts"

const AdminUsersPage = () => {
  const { session } = useAuth()
  const { userService } = useServices()
  const { users, setUsers, updateUser, removeUser } = useAdmin()
  const [search, setSearch] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<Role>("customer")
  const [deleting, setDeleting] = useState<UserResponse | null>(null)

  const fetchUsers = useCallback(
    async (term: string) => {
      const response = await userService.getUsers(term)
      if (response.status === "ok") {
        setUsers(response.data)
      } else {
        toast.error(response.data.description || response.data.message)
      }
    },
    [userService, setUsers]
  )

  const loadUsersAction = useAsyncAction(fetchUsers)
  const loadUsers = loadUsersAction.execute

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(search), 250)
    return () => clearTimeout(timer)
  }, [search, loadUsers])

  const report = (response: ServiceResult, success: string) => {
    if (response.status === "ok") {
      toast.success(success)
      return true
    }
    toast.error(response.data.description || response.data.message)
    return false
  }

  const blockAction = useAsyncAction(async (user: UserResponse) => {
    const blocked = user.status !== "BLOCKED"
    const response = await userService.setBlocked(user.id, { blocked })
    if (report(response, blocked ? "User blocked" : "User unblocked")) {
      updateUser(user.id, { status: blocked ? "BLOCKED" : "ACTIVE" })
    }
  })

  const roleAction = useAsyncAction(async (userId: string, role: Role) => {
    const response = await userService.setRole(userId, { role })
    if (report(response, "Role updated")) updateUser(userId, { role })
  })

  const inviteAction = useAsyncAction(async () => {
    const response = await userService.invite({
      email: inviteEmail,
      role: inviteRole,
    })
    if (report(response, "Invitation sent")) {
      setInviteOpen(false)
      setInviteEmail("")
      await loadUsers(search)
    }
  })

  const deleteAction = useAsyncAction(async () => {
    if (!deleting) return
    const response = await userService.deleteUser(deleting.id)
    if (report(response, "User deleted")) removeUser(deleting.id)
    setDeleting(null)
  })

  return (
    <>
      <PageHeader
        title="Users"
        action={
          <Button onClick={() => setInviteOpen(true)}>Invite user</Button>
        }
      />
      <Input
        placeholder="Search by email"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-sm"
      />
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isSelf = user.id === session?.userId
                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        disabled={isSelf}
                        onValueChange={(value) =>
                          roleAction.execute(user.id, value as Role)
                        }
                      >
                        <SelectTrigger size="sm" className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.status} />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSelf || blockAction.isPending}
                        onClick={() => blockAction.execute(user)}
                      >
                        {user.status === "BLOCKED" ? "Unblock" : "Block"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isSelf}
                        onClick={() => setDeleting(user)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite user</DialogTitle>
            <DialogDescription>
              They will receive an email to set a password.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as Role)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              onClick={() => inviteAction.execute()}
              disabled={!inviteEmail || inviteAction.isPending}
            >
              Send invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleting?.email}?</DialogTitle>
            <DialogDescription>
              This removes the user permanently and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteAction.isPending}
              onClick={() => deleteAction.execute()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdminUsersPage
