export function formatMoney(amount: number, currency = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(
    amount
  )
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

export function shortId(id: string): string {
  return id.slice(0, 8)
}
