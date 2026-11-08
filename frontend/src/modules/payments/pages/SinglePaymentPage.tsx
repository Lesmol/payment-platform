import { useCallback, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Card, CardContent } from "@/components/ui/card.tsx"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.tsx"
import { Input } from "@/components/ui/input.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"
import type { AccountResponse } from "@/api/services/account/account-types.ts"
import { useAsyncAction } from "@/hooks/useAsyncAction.ts"
import { useServices } from "@/hooks/useServices.ts"
import { useAccounts } from "@/modules/accounts/hooks/useAccounts.ts"
import {
  SinglePaymentFormSchema,
  type SinglePaymentFormInput,
  type SinglePaymentFormValues,
} from "@/modules/payments/schemas/single-payment.schema.ts"
import { BANKS } from "@/lib/banks.ts"
import { formatMoney } from "@/lib/format.ts"

const PAYMENT_TYPES = ["EFT", "INSTANT"]

const BANK_ITEMS = BANKS.map((bank) => ({
  value: bank.branchCode,
  label: `${bank.name} · ${bank.branchCode}`,
}))

function accountLabel(account: AccountResponse) {
  return `${account.accountNumber} · ${account.accountType.toLowerCase()} · ${formatMoney(account.balance, account.currency)}`
}

const SinglePaymentPage = () => {
  const { accountService, paymentService } = useServices()
  const { accounts, setAccounts } = useAccounts()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SinglePaymentFormInput, unknown, SinglePaymentFormValues>({
    resolver: zodResolver(SinglePaymentFormSchema),
    defaultValues: {
      fromAccountId: "",
      bank: "",
      toAccountNumber: "",
      amount: "",
      paymentType: "EFT",
    },
  })

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
  }, [loadAccounts])

  const paymentAction = useAsyncAction(
    async (values: SinglePaymentFormValues) => {
      const response = await paymentService.singlePayment({
        fromAccountId: values.fromAccountId,
        toAccountNumber: values.toAccountNumber,
        branchCode: values.bank,
        amount: values.amount,
        paymentType: values.paymentType,
      })

      if (response.status === "ok") {
        toast.success("Payment submitted")
        reset({
          fromAccountId: values.fromAccountId,
          bank: values.bank,
          toAccountNumber: "",
          amount: "",
          paymentType: values.paymentType,
        })
        await loadAccounts()
      } else {
        toast.error(response.data.description || response.data.message)
      }
    }
  )

  const onSubmit = (values: SinglePaymentFormValues) => {
    paymentAction.execute(values).catch(() => {
      toast.error("Unable to connect. Please check your network and try again.")
    })
  }

  const accountItems = accounts.map((account) => ({
    value: account.id,
    label: accountLabel(account),
  }))

  return (
    <>
      <PageHeader
        title="Make a payment"
        description="Send money to another account."
      />
      <Card className="max-w-lg">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.fromAccountId}>
                <FieldLabel>From account</FieldLabel>
                <Controller
                  control={control}
                  name="fromAccountId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
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
                  )}
                />
                <FieldError errors={[errors.fromAccountId]} />
              </Field>
              <Field data-invalid={!!errors.bank}>
                <FieldLabel>Bank</FieldLabel>
                <Controller
                  control={control}
                  name="bank"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={BANK_ITEMS}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANKS.map((bank) => (
                          <SelectItem
                            key={bank.branchCode}
                            value={bank.branchCode}
                          >
                            {bank.name} · {bank.branchCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.bank]} />
              </Field>
              <Field data-invalid={!!errors.toAccountNumber}>
                <FieldLabel htmlFor="toAccountNumber">
                  To account number
                </FieldLabel>
                <Input
                  id="toAccountNumber"
                  inputMode="numeric"
                  className="font-mono"
                  {...register("toAccountNumber")}
                />
                <FieldError errors={[errors.toAccountNumber]} />
              </Field>
              <Field data-invalid={!!errors.amount}>
                <FieldLabel htmlFor="amount">Amount</FieldLabel>
                <Input
                  id="amount"
                  inputMode="decimal"
                  {...register("amount")}
                />
                <FieldError errors={[errors.amount]} />
              </Field>
              <Field data-invalid={!!errors.paymentType}>
                <FieldLabel>Payment type</FieldLabel>
                <Controller
                  control={control}
                  name="paymentType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.paymentType]} />
              </Field>
              <Button type="submit" disabled={paymentAction.isPending}>
                {paymentAction.isPending ? "Sending…" : "Send payment"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default SinglePaymentPage
