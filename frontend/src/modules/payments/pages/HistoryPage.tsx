import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/PageHeader.tsx"
import { Alert, AlertDescription } from "@/components/ui/alert.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { useAsyncAction } from "@/hooks/useAsyncAction.ts"
import { useServices } from "@/hooks/useServices.ts"
import { PaymentsTable } from "@/modules/payments/components/PaymentsTable.tsx"
import { usePayments } from "@/modules/payments/hooks/usePayments.ts"

const HistoryPage = () => {
  const { paymentService } = useServices()
  const { payments, setPayments } = usePayments()
  const [errorMessage, setErrorMessage] = useState("")

  const fetchPayments = useCallback(async () => {
    const response = await paymentService.getPayments()
    if (response.status === "ok") {
      setPayments(response.data)
    } else {
      setErrorMessage(response.data.description || response.data.message)
    }
  }, [paymentService, setPayments])

  const loadPaymentsAction = useAsyncAction(fetchPayments)
  const loadPayments = loadPaymentsAction.execute

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  return (
    <>
      <PageHeader title="Payment history" />
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent>
          {loadPaymentsAction.isPending ? (
            <Skeleton className="h-40" />
          ) : (
            <PaymentsTable payments={payments} />
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default HistoryPage
