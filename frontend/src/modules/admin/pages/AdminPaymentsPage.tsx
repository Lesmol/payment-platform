import { useCallback, useEffect, useState } from "react"
import { PageHeader } from "@/components/PageHeader.tsx"
import { Alert, AlertDescription } from "@/components/ui/alert.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { Skeleton } from "@/components/ui/skeleton.tsx"
import { useAsyncAction } from "@/hooks/useAsyncAction.ts"
import { useServices } from "@/hooks/useServices.ts"
import { PaymentsTable } from "@/modules/payments/components/PaymentsTable.tsx"
import { usePayments } from "@/modules/payments/hooks/usePayments.ts"

const AdminPaymentsPage = () => {
  const { paymentService } = useServices()
  const { allPayments, setAllPayments } = usePayments()
  const [errorMessage, setErrorMessage] = useState("")

  const fetchAllPayments = useCallback(async () => {
    const response = await paymentService.getAllPayments()
    if (response.status === "ok") {
      setAllPayments(response.data)
    } else {
      setErrorMessage(response.data.description || response.data.message)
    }
  }, [paymentService, setAllPayments])

  const loadPaymentsAction = useAsyncAction(fetchAllPayments)
  const loadPayments = loadPaymentsAction.execute

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  return (
    <>
      <PageHeader
        title="All payments"
        description="Every payment across all customers."
      />
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
            <PaymentsTable payments={allPayments} />
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default AdminPaymentsPage
