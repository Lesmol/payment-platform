import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader.tsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Progress } from "@/components/ui/progress.tsx"
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
import type { AccountResponse } from "@/api/services/account/account-types.ts"
import type {
  BulkPaymentResponse,
  BulkProgressResponse,
} from "@/api/services/payment/payment-types.ts"
import { useAsyncAction } from "@/hooks/useAsyncAction.ts"
import { useServices } from "@/hooks/useServices.ts"
import { useAccounts } from "@/modules/accounts/hooks/useAccounts.ts"
import { formatMoney } from "@/lib/format.ts"

const COLUMNS =
  "branch code, bank, amount, to account, my reference, their reference"
const POLL_INTERVAL_MS = 600

function accountLabel(account: AccountResponse) {
  return `${account.accountNumber} · ${account.accountType.toLowerCase()} · ${formatMoney(account.balance, account.currency)}`
}

const BulkPaymentPage = () => {
  const { accountService, paymentService } = useServices()
  const { accounts, setAccounts } = useAccounts()
  const [sourceId, setSourceId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<BulkPaymentResponse | null>(null)
  const [progress, setProgress] = useState<BulkProgressResponse | null>(null)
  const [progressUnavailable, setProgressUnavailable] = useState(false)
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollTimer.current) clearTimeout(pollTimer.current)
    pollTimer.current = null
  }, [])

  const pollProgress = useCallback(
    async function poll(batchId: string) {
      const response = await paymentService.getBulkProgress(batchId)
      if (response.status === "error") {
        setProgressUnavailable(true)
        return
      }
      setProgress(response.data)
      if (response.data.status === "PROCESSING") {
        pollTimer.current = setTimeout(() => poll(batchId), POLL_INTERVAL_MS)
      }
    },
    [paymentService]
  )

  const fetchAccounts = useCallback(async () => {
    const response = await accountService.getAccounts()
    if (response.status === "ok") {
      setAccounts(response.data)
    } else {
      toast.error(response.data.description || response.data.message)
    }
  }, [accountService, setAccounts])

  const loadAccountsAction = useAsyncAction(fetchAccounts)
  const loadAccounts = loadAccountsAction.execute

  useEffect(() => {
    loadAccounts()
    return stopPolling
  }, [loadAccounts, stopPolling])

  const uploadAction = useAsyncAction(async () => {
    if (!file || !sourceId) return

    stopPolling()
    setResult(null)
    setProgress(null)
    setProgressUnavailable(false)

    const response = await paymentService.bulkPayment(file, sourceId)

    if (response.status === "ok") {
      setResult(response.data)
      if (response.data.errors.length === 0) pollProgress(response.data.batchId)
    } else {
      toast.error(response.data.description || response.data.message)
    }
  })

  const onUpload = () => {
    uploadAction.execute().catch(() => {
      toast.error("Unable to connect. Please check your network and try again.")
    })
  }

  const accountItems = accounts.map((account) => ({
    value: account.id,
    label: accountLabel(account),
  }))
  const percent =
    progress && progress.total > 0
      ? Math.round((progress.processed / progress.total) * 100)
      : 0

  return (
    <>
      <PageHeader
        title="Bulk payments"
        description="Upload a CSV to pay many recipients at once."
      />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>
            Columns: {COLUMNS}. The first row is a header.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>Source account</FieldLabel>
              <Select
                value={sourceId}
                onValueChange={(value) => setSourceId(value ?? "")}
                items={accountItems}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {accountLabel(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="file">CSV file</FieldLabel>
              <Input
                id="file"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </Field>
            <Button
              onClick={onUpload}
              disabled={!file || !sourceId || uploadAction.isPending}
            >
              {uploadAction.isPending ? "Uploading…" : "Upload and validate"}
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>

      {result && result.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.errors.length} of {result.totalRows} rows have errors
            </CardTitle>
            <CardDescription>
              Fix these rows and upload the file again. Nothing was submitted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Problem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.errors.map((error) => (
                  <TableRow key={`${error.row}-${error.field}`}>
                    <TableCell>{error.row}</TableCell>
                    <TableCell>{error.field}</TableCell>
                    <TableCell>{error.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {result && result.errors.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch accepted</CardTitle>
            <CardDescription className="font-mono">
              {result.batchId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {progress && !progressUnavailable ? (
              <>
                <Progress value={percent} />
                <p className="text-sm text-muted-foreground">
                  {progress.processed} of {progress.total} processed
                  {progress.failed > 0 && `, ${progress.failed} failed`}
                  {progress.status === "COMPLETED" && " · done"}
                </p>
              </>
            ) : (
              <Alert>
                <AlertTitle>{result.validRows} payments queued</AlertTitle>
                {progressUnavailable && (
                  <AlertDescription>
                    Live progress is not available yet.
                  </AlertDescription>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default BulkPaymentPage
