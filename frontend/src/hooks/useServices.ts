import { loginService } from "@/api/services/login/login-service.ts"
import { accountService } from "@/api/services/account/account-service.ts"
import { paymentService } from "@/api/services/payment/payment-service.ts"
import { userService } from "@/api/services/user/user-service.ts"

export function useServices() {
  return {
    loginService,
    accountService,
    paymentService,
    userService,
  }
}
