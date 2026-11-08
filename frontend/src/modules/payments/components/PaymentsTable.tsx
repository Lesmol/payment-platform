import { StatusBadge } from "@/components/StatusBadge.tsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx"
import type { PaymentResponse } from "@/api/services/payment/payment-types.ts"
import { bankName } from "@/lib/banks.ts"
import { formatDate, formatMoney, shortId } from "@/lib/format.ts"

export function PaymentsTable({ payments }: { payments: PaymentResponse[] }) {
  if (payments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No payments yet.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>To account</TableHead>
          <TableHead>Bank</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{formatDate(payment.createdAt)}</TableCell>
            <TableCell className="font-mono text-xs">
              {shortId(payment.id)}
            </TableCell>
            <TableCell className="font-mono text-xs">
              {payment.toAccountNumber}
            </TableCell>
            <TableCell>{bankName(payment.branchCode)}</TableCell>
            <TableCell>{payment.paymentType}</TableCell>
            <TableCell>
              <StatusBadge status={payment.status} />
            </TableCell>
            <TableCell className="text-right">
              {formatMoney(payment.amount, payment.currency)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
