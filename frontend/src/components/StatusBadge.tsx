import { Badge } from "@/components/ui/badge.tsx"

const VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  COMPLETED: "default",
  ACTIVE: "default",
  PENDING: "secondary",
  INVITED: "secondary",
  FAILED: "destructive",
  BLOCKED: "destructive",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? "outline"}>
      {status.toLowerCase()}
    </Badge>
  )
}
