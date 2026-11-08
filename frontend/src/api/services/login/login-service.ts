import { HttpService, type ServiceResult } from "../HttpService"
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  SignUpRequest,
} from "@/api/services/login/login-types.ts"
import {
  LoginRequestSchema,
  RefreshRequestSchema,
} from "@/api/services/login/login-request-schema.ts"
import { LoginResponseSchema } from "@/api/services/login/login-response-schema.ts"
import { LOGIN_ENDPOINTS } from "@/api/services/login/login-endpoints.ts"
import { ENDPOINTS } from "@/api/api-paths.ts"

class LoginService extends HttpService {
  private basePath = ENDPOINTS.AUTH

  async login(request: LoginRequest): Promise<ServiceResult<LoginResponse>> {
    const body = LoginRequestSchema.parse(request)
    return this.post(
      this.path(LOGIN_ENDPOINTS.LOGIN),
      body,
      LoginResponseSchema
    )
  }

  async signUp(request: SignUpRequest): Promise<ServiceResult> {
    const body = LoginRequestSchema.parse(request)
    return this.post(this.path(LOGIN_ENDPOINTS.SIGN_UP), body)
  }

  async refresh(
    request: RefreshRequest
  ): Promise<ServiceResult<LoginResponse>> {
    const body = RefreshRequestSchema.parse(request)
    return this.post(
      this.path(LOGIN_ENDPOINTS.REFRESH),
      body,
      LoginResponseSchema
    )
  }

  path(endpoint?: string) {
    return endpoint ? `${this.basePath}/${endpoint}` : this.basePath
  }
}

export const loginService = new LoginService()
