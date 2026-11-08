import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/PageHeader.tsx"
import { StatusBadge } from "@/components/StatusBadge.tsx"
import { Alert, AlertDescription } from "@/components/ui/alert.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx"
import type { AccountTransactionResponse } from "@/api/services/account/account-types.ts"
import { useAsyncAction } from "@/hooks/useAsyncAction.ts"
import { useServices } from "@/hooks/useServices.ts"
import { useAccounts } from "@/modules/accounts/hooks/useAccounts.ts"
import { formatDate, formatMoney } from "@/lib/format.ts"

const PAGE_SIZE = 10

const AccountsPage = () => {
  const { accountService } = useServices()
  const { accounts, setAccounts } = useAccounts()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<
    AccountTransactionResponse[]
  >([])
  const [page, setPage] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")

  const fetchAccounts = useCallback(async () => {
    const response = await accountService.getAccounts()
    if (response.status === "ok") {
      setAccounts(response.data)
      setSelectedId((current) => current ?? response.data[0]?.id ?? null)
    } else {
      setErrorMessage(response.data.description || response.data.message)
    }
  }, [accountService, setAccounts])

  const fetchTransactions = useCallback(
    async (accountId: string, pageNumber: number) => {
      const response = await accountService.getTransactions(
        accountId,
        pageNumber,
        PAGE_SIZE
      )
      if (response.status === "ok") {
        setTransactions(response.data)
      } else {
        setErrorMessage(response.data.description || response.data.message)
      }
    },
    [accountService]
  )

  const loadAccountsAction = useAsyncAction(fetchAccounts)
  const loadTransactionsAction = useAsyncAction(fetchTransactions)
  const loadAccounts = loadAccountsAction.execute
  const loadTransactions = loadTransactionsAction.execute

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  useEffect(() => {
    if (selectedId) loadTransactions(selectedId, page)
  }, [selectedId, page, loadTransactions])

  const selected = accounts.find((account) => account.id === selectedId)

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Balances and recent activity."
      />
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {loadAccountsAction.isPending && accounts.length === 0 && (
          <Skeleton className="h-32" />
        )}
        {accounts.map((account) => (
          <button
            key={account.id}
            type="button"
            className="text-left"
            onClick={() => {
              setSelectedId(account.id)
              setPage(0)
            }}
          >
            <Card
              className={
                account.id === selectedId ? "ring-2 ring-ring" : undefined
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {account.accountType.toLowerCase()}
                  <StatusBadge status={account.status} />
                </CardTitle>
                <CardDescription className="font-mono">
                  {account.accountNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {formatMoney(account.balance, account.currency)}
                </p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription className="font-mono">
              {selected.accountNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No transactions.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance after</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>{transaction.type.toLowerCase()}</TableCell>
                      <TableCell className="text-right">
                        {transaction.type === "DEBIT" ? "-" : "+"}
                        {formatMoney(transaction.amount, selected.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMoney(
                          transaction.balanceAfter,
                          selected.currency
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={transactions.length < PAGE_SIZE}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default AccountsPage
