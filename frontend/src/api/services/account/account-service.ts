import { z } from "zod"
import { HttpService, type ServiceResult } from "../HttpService"
import {
  AccountResponseSchema,
  AccountTransactionResponseSchema,
} from "@/api/services/account/account-response-schema.ts"
import type {
  AccountResponse,
  AccountTransactionResponse,
} from "@/api/services/account/account-types.ts"
import { ACCOUNT_ENDPOINTS } from "@/api/services/account/account-endpoints.ts"
import { ENDPOINTS } from "@/api/api-paths.ts"

class AccountService extends HttpService {
  private basePath = ENDPOINTS.ACCOUNT

  async getAccounts(): Promise<ServiceResult<AccountResponse[]>> {
    return this.get(this.path(), z.array(AccountResponseSchema))
  }

  async getAccount(accountId: string): Promise<ServiceResult<AccountResponse>> {
    return this.get(
      this.path(
        ACCOUNT_ENDPOINTS.GET_ACCOUNT.replace("{accountId}", accountId)
      ),
      AccountResponseSchema
    )
  }

  async getTransactions(
    accountId: string,
    pageNumber: number,
    pageSize: number
  ): Promise<ServiceResult<AccountTransactionResponse[]>> {
    const endpoint = ACCOUNT_ENDPOINTS.GET_TRANSACTIONS.replace(
      "{accountId}",
      accountId
    )
    return this.get(
      `${this.path(endpoint)}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      z.array(AccountTransactionResponseSchema)
    )
  }

  path(endpoint?: string) {
    return endpoint ? `${this.basePath}/${endpoint}` : this.basePath
  }
}

export const accountService = new AccountService()
