"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "shrink-0 rounded-full border transition-all outline-none peer group/switch relative inline-flex items-center cursor-pointer",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "data-checked:bg-primary data-checked:border-primary",
        "data-unchecked:bg-muted data-unchecked:border-border hover:data-unchecked:bg-muted/80",
        "shadow-sm",
        "data-[size=sm]:h-5 data-[size=sm]:w-9",
        "data-[size=default]:h-6 data-[size=default]:w-11",
        "data-[size=lg]:h-7 data-[size=lg]:w-12",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full transition-transform shadow-sm",
          "data-checked:bg-primary-foreground",
          "data-unchecked:bg-background",
          "group-data-[size=sm]/switch:size-4 group-data-[size=sm]/switch:data-checked:translate-x-[18px] group-data-[size=sm]/switch:data-unchecked:translate-x-0.5",
          "group-data-[size=default]/switch:size-5 group-data-[size=default]/switch:data-checked:translate-x-[22px] group-data-[size=default]/switch:data-unchecked:translate-x-0.5",
          "group-data-[size=lg]/switch:size-6 group-data-[size=lg]/switch:data-checked:translate-x-[22px] group-data-[size=lg]/switch:data-unchecked:translate-x-0.5"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
