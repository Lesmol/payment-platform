import { ENDPOINTS } from "@/api/api-paths.ts"
import { JwtUtils } from "@/utils/jwt.utils.ts"
import type { Role } from "@/api/services/user/user-types.ts"
import { mockDb } from "@/api/mock/mock-db.ts"
import type {
  BulkPaymentResponse,
  SinglePaymentRequest,
} from "@/api/services/payment/payment-types.ts"

export interface MockContext {
  url: URL
  params: string[]
  body: unknown
  userId: string
  role: Role
}

export interface MockReply {
  status: number
  body?: unknown
}

type MockHandler = (context: MockContext) => MockReply | Promise<MockReply>

export interface MockRoute {
  method: string
  pattern: RegExp
  handler: MockHandler
}

const MOCK_PASSWORD = "password"
const CSV_COLUMNS = 6

const ok = (body?: unknown): MockReply => ({ status: 200, body })

const fail = (
  status: number,
  message: string,
  description = ""
): MockReply => ({ status, body: { message, description } })

const newId = () => crypto.randomUUID()

function tokensFor(userId: string, email: string, role: Role) {
  const claims = {
    sub: userId,
    email,
    realm_access: {
      roles: role === "admin" ? ["admin", "customer"] : ["customer"],
    },
  }
  return {
    access_token: JwtUtils.encodeFake(claims),
    refresh_token: JwtUtils.encodeFake(claims),
    expires_in: 300,
    token_type: "Bearer",
  }
}

function requireAdmin(context: MockContext): MockReply | null {
  return context.role === "admin"
    ? null
    : fail(403, "Forbidden", "Admin access required")
}

function findUser(userId: string) {
  return mockDb.users.find((user) => user.id === userId)
}

function parseCsvLine(line: string): string[] {
  return line.split(",").map((cell) => cell.trim())
}

const authRoutes: MockRoute[] = [
  {
    method: "POST",
    pattern: new RegExp(`^${ENDPOINTS.AUTH}/login-with-password$`),
    handler: ({ body }) => {
      const { email, password } = body as { email: string; password: string }
      const user = mockDb.users.find(
        (candidate) => candidate.email === email.toLowerCase()
      )
      if (!user || password !== MOCK_PASSWORD) {
        return fail(401, "Authentication failed", "Invalid email or password")
      }
      if (user.status === "BLOCKED") {
        return fail(403, "Account blocked", "Contact support")
      }
      return ok(tokensFor(user.id, user.email, user.role))
    },
  },
  {
    method: "POST",
    pattern: new RegExp(`^${ENDPOINTS.AUTH}/sign-up$`),
    handler: ({ body }) => {
      const { email } = body as { email: string }
      if (mockDb.users.some((user) => user.email === email.toLowerCase())) {
        return fail(409, "Registration failed", "Email is already registered")
      }
      mockDb.users.push({
        id: newId(),
        email: email.toLowerCase(),
        role: "customer",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      })
      return ok()
    },
  },
  {
    method: "POST",
    pattern: new RegExp(`^${ENDPOINTS.AUTH}/refresh$`),
    handler: ({ body }) => {
      const { refreshToken } = body as { refreshToken: string }
      const user = findUser(JwtUtils.decodeClaims(refreshToken).sub ?? "")
      if (!user) return fail(401, "Session expired")
      return { status: 201, body: tokensFor(user.id, user.email, user.role) }
    },
  },
]

const accountRoutes: MockRoute[] = [
  {
    method: "GET",
    pattern: new RegExp(`^${ENDPOINTS.ACCOUNT}$`),
    handler: ({ userId }) =>
      ok(mockDb.accounts.filter((account) => account.customerId === userId)),
  },
  {
    method: "GET",
    pattern: new RegExp(`^${ENDPOINTS.ACCOUNT}/account-transactions/([^/]+)$`),
    handler: ({ params, url }) => {
      const pageNumber = Number(url.searchParams.get("pageNumber") ?? 0)
      const pageSize = Number(url.searchParams.get("pageSize") ?? 10)
      const rows = mockDb.transactions
        .filter((transaction) => transaction.accountId === params[0])
        .sort((a, b) => b.id - a.id)
      return ok(rows.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize))
    },
  },
  {
    method: "GET",
    pattern: new RegExp(`^${ENDPOINTS.ACCOUNT}/([^/]+)$`),
    handler: ({ params }) => {
      const account = mockDb.accounts.find(
        (candidate) => candidate.id === params[0]
      )
      return account
        ? ok(account)
        : fail(404, "Not found", "Account does not exist")
    },
  },
]

const paymentRoutes: MockRoute[] = [
  {
    method: "POST",
    pattern: new RegExp(`^${ENDPOINTS.PAYMENT}/single-payment$`),
    handler: ({ body, userId }) => {
      const input = body as SinglePaymentRequest
      const from = mockDb.accounts.find(
        (account) => account.id === input.fromAccountId
      )
      if (!from || from.customerId !== userId) {
        return fail(404, "Not found", "Source account does not exist")
      }
      if (from.accountNumber === input.toAccountNumber) {
        return fail(
          400,
          "Validation failed",
          "Source and destination must differ"
        )
      }
      if (from.balance < input.amount) {
        return fail(422, "Payment declined", "Insufficient funds")
      }
      const id = newId()
      const createdAt = new Date().toISOString()
      from.balance -= input.amount
      from.updatedAt = createdAt
      mockDb.payments.unshift({
        id,
        customerId: from.customerId,
        fromAccountId: from.id,
        toAccountNumber: input.toAccountNumber,
        branchCode: input.branchCode,
        amount: input.amount,
        currency: from.currency,
        paymentType: input.paymentType,
        status: "COMPLETED",
        batchId: null,
        createdAt,
      })
      mockDb.transactions.push({
        id: mockDb.transactions.length + 1,
        accountId: from.id,
        paymentId: id,
        type: "DEBIT",
        amount: input.amount,
        balanceAfter: from.balance,
        createdAt,
      })
      return ok()
    },
  },
  {
    method: "POST",
    pattern: new RegExp(`^${ENDPOINTS.PAYMENT}/bulk$`),
    handler: async ({ body, userId }) => {
      const form = body as FormData
      const file = form.get("file")
      const source = mockDb.accounts.find(
        (account) => account.id === form.get("sourceAccountId")
      )
      if (
        !(file instanceof File) ||
        !file.name.toLowerCase().endsWith(".csv")
      ) {
        return fail(400, "Validation failed", "file must be a CSV")
      }
      if (!source || source.customerId !== userId) {
        return fail(404, "Not found", "Source account does not exist")
      }
      const lines = (await file.text())
        .replace(/^﻿/, "")
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")
      if (lines.length === 0 || parseCsvLine(lines[0]).length < 2) {
        return fail(
          400,
          "Validation failed",
          "file must be a CSV with a header row"
        )
      }
      const rows = lines.slice(1).map(parseCsvLine)
      const errors: BulkPaymentResponse["errors"] = []
      rows.forEach((cells, index) => {
        const row = index + 1
        if (cells.length < CSV_COLUMNS) {
          errors.push({
            row,
            field: "row",
            message: `expected ${CSV_COLUMNS} columns`,
          })
          return
        }
        const amount = Number(cells[2])
        if (!Number.isFinite(amount) || amount <= 0) {
          errors.push({
            row,
            field: "amount",
            message: "must be a positive number",
          })
        }
      })
      const batchId = newId()
      if (errors.length === 0) {
        const createdAt = new Date().toISOString()
        rows.forEach((cells) => {
          mockDb.payments.unshift({
            id: newId(),
            customerId: source.customerId,
            fromAccountId: source.id,
            toAccountNumber: cells[3],
            branchCode: cells[0],
            amount: Number(cells[2]),
            currency: source.currency,
            paymentType: "BULK",
            status: "PENDING",
            batchId,
            createdAt,
          })
        })
        mockDb.bulkProgress.set(batchId, 0)
      }
      return ok({
        batchId,
        totalRows: rows.length,
        validRows: rows.length - errors.length,
        errors,
      })
    },
  },
  {
    method: "GET",
    pattern: new RegExp(`^${ENDPOINTS.PAYMENT}/bulk/([^/]+)/progress$`),
    handler: ({ params }) => {
      const batchId = params[0]
      const batch = mockDb.payments.filter(
        (payment) => payment.batchId === batchId
      )
      if (batch.length === 0)
        return fail(404, "Not found", "Batch does not exist")
      const processed = Math.min(
        (mockDb.bulkProgress.get(batchId) ?? 0) + 1,
        batch.length
      )
      mockDb.bulkProgress.set(batchId, processed)
      batch.forEach((payment, index) => {
        if (index < processed && payment.status === "PENDING") {
          payment.status = index % 7 === 6 ? "FAILED" : "COMPLETED"
        }
      })
      const failed = batch.filter(
        (payment) => payment.status === "FAILED"
      ).length
      return ok({
        batchId,
        total: batch.length,
        processed,
        failed,
        status: processed >= batch.length ? "COMPLETED" : "PROCESSING",
      })
    },
  },
  {
    method: "GET",
    pattern: new RegExp(`^${ENDPOINTS.PAYMENT}/all$`),
    handler: (context) => requireAdmin(context) ?? ok(mockDb.payments),
  },
  {
    method: "GET",
    pattern: new RegExp(`^${ENDPOINTS.PAYMENT}$`),
    handler: ({ userId }) =>
      ok(mockDb.payments.filter((payment) => payment.customerId === userId)),
  },
]

const userRoutes: MockRoute[] = [
  {
    method: "GET",
    pattern: new RegExp(`^${ENDPOINTS.USER}$`),
    handler: (context) => {
      const denied = requireAdmin(context)
      if (denied) return denied
      const term = (context.url.searchParams.get("search") ?? "").toLowerCase()
      return ok(mockDb.users.filter((user) => user.email.includes(term)))
    },
  },
  {
    method: "POST",
    pattern: new RegExp(`^${ENDPOINTS.USER}/invite$`),
    handler: (context) => {
      const denied = requireAdmin(context)
      if (denied) return denied
      const { email, role } = context.body as { email: string; role: Role }
      if (mockDb.users.some((user) => user.email === email.toLowerCase())) {
        return fail(409, "Invite failed", "Email is already registered")
      }
      mockDb.users.push({
        id: newId(),
        email: email.toLowerCase(),
        role,
        status: "INVITED",
        createdAt: new Date().toISOString(),
      })
      return ok()
    },
  },
  {
    method: "PATCH",
    pattern: new RegExp(`^${ENDPOINTS.USER}/([^/]+)/block$`),
    handler: (context) => {
      const denied = requireAdmin(context)
      if (denied) return denied
      const user = findUser(context.params[0])
      if (!user) return fail(404, "Not found", "User does not exist")
      const { blocked } = context.body as { blocked: boolean }
      user.status = blocked ? "BLOCKED" : "ACTIVE"
      return ok()
    },
  },
  {
    method: "PATCH",
    pattern: new RegExp(`^${ENDPOINTS.USER}/([^/]+)/role$`),
    handler: (context) => {
      const denied = requireAdmin(context)
      if (denied) return denied
      const user = findUser(context.params[0])
      if (!user) return fail(404, "Not found", "User does not exist")
      user.role = (context.body as { role: Role }).role
      return ok()
    },
  },
  {
    method: "DELETE",
    pattern: new RegExp(`^${ENDPOINTS.USER}/([^/]+)$`),
    handler: (context) => {
      const denied = requireAdmin(context)
      if (denied) return denied
      const user = findUser(context.params[0])
      if (!user) return fail(404, "Not found", "User does not exist")
      mockDb.users.splice(mockDb.users.indexOf(user), 1)
      return ok()
    },
  },
]

export const MOCK_ROUTES: MockRoute[] = [
  ...authRoutes,
  ...accountRoutes,
  ...paymentRoutes,
  ...userRoutes,
]
