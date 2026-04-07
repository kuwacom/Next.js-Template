import * as React from "react"

import { cn } from "@/lib/utils"

type CalloutVariant = "info" | "tip" | "warn"

const calloutStyles: Record<CalloutVariant, string> = {
  info: "border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-100",
  tip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100",
}

const calloutIcons: Record<CalloutVariant, string> = {
  info: "ℹ️",
  tip: "✨",
  warn: "⚠️",
}

type CalloutProps = React.ComponentPropsWithoutRef<"div"> & {
  variant?: CalloutVariant
  title?: string
}

export function Callout({
  children,
  className,
  title,
  variant = "info",
  ...props
}: CalloutProps) {
  return (
    <div
      className={cn(
        "my-6 rounded-xl border px-4 py-4 shadow-sm",
        calloutStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="pt-0.5 text-base leading-none">
          {calloutIcons[variant]}
        </span>

        <div className="min-w-0 flex-1">
          {title ? <p className="mb-1 font-semibold">{title}</p> : null}
          <div className="leading-7 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
