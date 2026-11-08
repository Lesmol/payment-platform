import type {
  AccountResponse,
  AccountTransactionResponse,
} from "@/api/services/account/account-types.ts"
import type { PaymentResponse } from "@/api/services/payment/payment-types.ts"
import type { UserResponse } from "@/api/services/user/user-types.ts"

export const CUSTOMER_ID = "11111111-1111-4111-8111-111111111111"
export const ADMIN_ID = "22222222-2222-4222-8222-222222222222"
export const THANDI_ID = "33333333-3333-4333-8333-333333333333"
export const CURRENT_ACCOUNT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
export const SAVINGS_ACCOUNT_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
export const THANDI_ACCOUNT_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc"

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString()

export const mockDb = {
  users: [
    {
      id: CUSTOMER_ID,
      email: "customer@demo.test",
      role: "customer",
      status: "ACTIVE",
      createdAt: daysAgo(90),
    },
    {
      id: ADMIN_ID,
      email: "admin@demo.test",
      role: "admin",
      status: "ACTIVE",
      createdAt: daysAgo(120),
    },
    {
      id: THANDI_ID,
      email: "thandi@demo.test",
      role: "customer",
      status: "ACTIVE",
      createdAt: daysAgo(40),
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      email: "sipho@demo.test",
      role: "customer",
      status: "BLOCKED",
      createdAt: daysAgo(25),
    },
  ] as UserResponse[],
  accounts: [
    {
      id: CURRENT_ACCOUNT_ID,
      customerId: CUSTOMER_ID,
      accountNumber: "1029384756",
      accountType: "CURRENT",
      currency: "ZAR",
      balance: 48250.5,
      status: "ACTIVE",
      createdAt: daysAgo(90),
      updatedAt: daysAgo(1),
    },
    {
      id: SAVINGS_ACCOUNT_ID,
      customerId: CUSTOMER_ID,
      accountNumber: "5647382910",
      accountType: "SAVINGS",
      currency: "ZAR",
      balance: 120000,
      status: "ACTIVE",
      createdAt: daysAgo(80),
      updatedAt: daysAgo(10),
    },
    {
      id: THANDI_ACCOUNT_ID,
      customerId: THANDI_ID,
      accountNumber: "9988776655",
      accountType: "CURRENT",
      currency: "ZAR",
      balance: 9400,
      status: "ACTIVE",
      createdAt: daysAgo(40),
      updatedAt: daysAgo(3),
    },
  ] as AccountResponse[],
  transactions: [
    {
      id: 1,
      accountId: CURRENT_ACCOUNT_ID,
      paymentId: "p-1",
      type: "CREDIT",
      amount: 52000,
      balanceAfter: 52000,
      createdAt: daysAgo(30),
    },
    {
      id: 2,
      accountId: CURRENT_ACCOUNT_ID,
      paymentId: "p-2",
      type: "DEBIT",
      amount: 3200,
      balanceAfter: 48800,
      createdAt: daysAgo(12),
    },
    {
      id: 3,
      accountId: CURRENT_ACCOUNT_ID,
      paymentId: "p-3",
      type: "DEBIT",
      amount: 549.5,
      balanceAfter: 48250.5,
      createdAt: daysAgo(1),
    },
  ] as AccountTransactionResponse[],
  payments: [
    {
      id: "p-2",
      customerId: CUSTOMER_ID,
      fromAccountId: CURRENT_ACCOUNT_ID,
      toAccountNumber: "9988776655",
      branchCode: "250655",
      amount: 3200,
      currency: "ZAR",
      paymentType: "EFT",
      status: "COMPLETED",
      batchId: null,
      createdAt: daysAgo(12),
    },
    {
      id: "p-3",
      customerId: CUSTOMER_ID,
      fromAccountId: CURRENT_ACCOUNT_ID,
      toAccountNumber: "9988776655",
      branchCode: "250655",
      amount: 549.5,
      currency: "ZAR",
      paymentType: "INSTANT",
      status: "COMPLETED",
      batchId: null,
      createdAt: daysAgo(1),
    },
    {
      id: "p-4",
      customerId: THANDI_ID,
      fromAccountId: THANDI_ACCOUNT_ID,
      toAccountNumber: "1029384756",
      branchCode: "632005",
      amount: 800,
      currency: "ZAR",
      paymentType: "EFT",
      status: "FAILED",
      batchId: null,
      createdAt: daysAgo(5),
    },
  ] as PaymentResponse[],
  bulkProgress: new Map<string, number>(),
}
