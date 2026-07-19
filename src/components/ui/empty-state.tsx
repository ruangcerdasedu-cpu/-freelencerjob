import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Inbox, Search, Bookmark, Bot, MessageSquare, Settings } from "lucide-react"

const illustrations = {
  default: Inbox,
  search: Search,
  saved: Bookmark,
  mentor: Bot,
  communicate: MessageSquare,
  settings: Settings,
}

interface EmptyStateProps {
  icon?: keyof typeof illustrations
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({
  icon = "default",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = illustrations[icon]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center animate-fade-in",
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        action.href ? (
          <Button asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  )
}
