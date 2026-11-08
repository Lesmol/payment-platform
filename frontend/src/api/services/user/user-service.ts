import { z } from "zod"
import { HttpService, type ServiceResult } from "../HttpService"
import {
  BlockUserRequestSchema,
  ChangeRoleRequestSchema,
  InviteUserRequestSchema,
} from "@/api/services/user/user-request-schema.ts"
import { UserResponseSchema } from "@/api/services/user/user-response-schema.ts"
import type {
  BlockUserRequest,
  ChangeRoleRequest,
  InviteUserRequest,
  UserResponse,
} from "@/api/services/user/user-types.ts"
import { USER_ENDPOINTS } from "@/api/services/user/user-endpoints.ts"
import { ENDPOINTS } from "@/api/api-paths.ts"

class UserService extends HttpService {
  private basePath = ENDPOINTS.USER

  async getUsers(search = ""): Promise<ServiceResult<UserResponse[]>> {
    return this.get(
      `${this.path()}?search=${encodeURIComponent(search)}`,
      z.array(UserResponseSchema)
    )
  }

  async setBlocked(
    userId: string,
    request: BlockUserRequest
  ): Promise<ServiceResult> {
    const body = BlockUserRequestSchema.parse(request)
    return this.patch(this.userPath(USER_ENDPOINTS.BLOCK, userId), body)
  }

  async setRole(
    userId: string,
    request: ChangeRoleRequest
  ): Promise<ServiceResult> {
    const body = ChangeRoleRequestSchema.parse(request)
    return this.patch(this.userPath(USER_ENDPOINTS.ROLE, userId), body)
  }

  async invite(request: InviteUserRequest): Promise<ServiceResult> {
    const body = InviteUserRequestSchema.parse(request)
    return this.post(this.path(USER_ENDPOINTS.INVITE), body)
  }

  async deleteUser(userId: string): Promise<ServiceResult> {
    return this.delete(this.userPath(USER_ENDPOINTS.USER, userId))
  }

  private userPath(template: string, userId: string) {
    return this.path(template.replace("{userId}", userId))
  }

  path(endpoint?: string) {
    return endpoint ? `${this.basePath}/${endpoint}` : this.basePath
  }
}

export const userService = new UserService()
