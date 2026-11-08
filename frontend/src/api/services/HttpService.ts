import { ZodType } from "zod"
import { BASE_URL, USE_MOCKS } from "@/api/environment.ts"
import { ENDPOINTS } from "@/api/api-paths.ts"
import { mockRequest } from "@/api/mock/mock-adapter.ts"
import { tokenStorage } from "@/api/token-storage.ts"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface ErrorResponse {
  message: string
  description: string
}

export type ServiceResult<T = void> =
  { status: "ok"; data: T } | { status: "error"; data: ErrorResponse }

let refreshing: Promise<boolean> | null = null

async function rawRequest(
  method: HttpMethod,
  endpoint: string,
  body?: unknown
): Promise<Response> {
  const token = tokenStorage.accessToken

  if (USE_MOCKS) return mockRequest(method, endpoint, body, token)

  const headers: Record<string, string> = {
    "Correlation-id": crypto.randomUUID(),
  }
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm)
    headers["Content-Type"] = "application/json"
  if (token && !endpoint.startsWith(ENDPOINTS.AUTH)) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  })
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStorage.refreshToken
  if (!refreshToken) return false

  const response = await rawRequest("POST", `${ENDPOINTS.AUTH}/refresh`, {
    refreshToken,
  })
  if (!response.ok) return false

  const tokens = await response.json()
  tokenStorage.save(
    tokens.access_token,
    tokens.refresh_token,
    tokens.expires_in
  )
  return true
}

async function authorizedRequest(
  method: HttpMethod,
  endpoint: string,
  body?: unknown
): Promise<Response> {
  const response = await rawRequest(method, endpoint, body)
  const retryable =
    response.status === 401 &&
    !endpoint.startsWith(ENDPOINTS.AUTH) &&
    tokenStorage.refreshToken

  if (!retryable) return response

  refreshing ??= refreshTokens().finally(() => {
    refreshing = null
  })

  if (await refreshing) return rawRequest(method, endpoint, body)

  tokenStorage.clear()
  tokenStorage.notifyExpired()
  return response
}

export class HttpService {
  private ok<T>(data: T): ServiceResult<T> {
    return { status: "ok", data }
  }

  private error(message: string, description: string): ServiceResult<never> {
    return { status: "error", data: { message, description } }
  }

  private async parseError(response: Response): Promise<ServiceResult<never>> {
    try {
      const error = await response.json()
      return this.error(error.message, error.description)
    } catch {
      return this.error(response.statusText || "Request Failed", "")
    }
  }

  private async send<TResponse>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    schema?: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse | void>> {
    try {
      const response = await authorizedRequest(method, endpoint, body)

      if (!response.ok) return this.parseError(response)

      if (!schema) return this.ok(undefined)

      const result = schema.safeParse(await response.json())
      if (!result.success)
        return this.error("Validation Error", result.error.message)

      return this.ok(result.data)
    } catch (e) {
      console.error(e instanceof Error ? e.stack : e)
      return this.error(
        "Request Failed",
        e instanceof Error ? e.message : "An unexpected error occurred"
      )
    }
  }

  protected async get(endpoint: string): Promise<ServiceResult>

  protected async get<TResponse>(
    endpoint: string,
    schema: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse>>
  protected async get<TResponse>(
    endpoint: string,
    schema?: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse | void>> {
    return this.send("GET", endpoint, undefined, schema)
  }

  protected async post<TBody>(
    endpoint: string,
    body?: TBody
  ): Promise<ServiceResult>

  protected async post<TBody, TResponse>(
    endpoint: string,
    body: TBody,
    schema: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse>>
  protected async post<TBody, TResponse>(
    endpoint: string,
    body?: TBody,
    schema?: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse | void>> {
    return this.send("POST", endpoint, body, schema)
  }

  protected async put<TBody>(
    endpoint: string,
    body?: TBody
  ): Promise<ServiceResult>

  protected async put<TBody, TResponse>(
    endpoint: string,
    body: TBody,
    schema: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse>>
  protected async put<TBody, TResponse>(
    endpoint: string,
    body?: TBody,
    schema?: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse | void>> {
    return this.send("PUT", endpoint, body, schema)
  }

  protected async patch<TBody>(
    endpoint: string,
    body?: TBody
  ): Promise<ServiceResult>

  protected async patch<TBody, TResponse>(
    endpoint: string,
    body: TBody,
    schema: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse>>
  protected async patch<TBody, TResponse>(
    endpoint: string,
    body?: TBody,
    schema?: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse | void>> {
    return this.send("PATCH", endpoint, body, schema)
  }

  protected async delete(endpoint: string): Promise<ServiceResult>

  protected async delete<TResponse>(
    endpoint: string,
    schema: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse>>
  protected async delete<TResponse>(
    endpoint: string,
    schema?: ZodType<TResponse>
  ): Promise<ServiceResult<TResponse | void>> {
    return this.send("DELETE", endpoint, undefined, schema)
  }
}
