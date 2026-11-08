let expiredHandler: () => void = () => {}

export const tokenStorage = {
  get accessToken() {
    return localStorage.getItem("accessToken")
  },
  get refreshToken() {
    return localStorage.getItem("refreshToken")
  },
  save(accessToken: string, refreshToken: string, expiresIn: number) {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
    localStorage.setItem("expiresIn", expiresIn.toString())
    localStorage.setItem("loginTime", Date.now().toString())
  },
  clear() {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("expiresIn")
    localStorage.removeItem("loginTime")
  },
  onExpired(handler: () => void) {
    expiredHandler = handler
  },
  notifyExpired() {
    expiredHandler()
  },
}
