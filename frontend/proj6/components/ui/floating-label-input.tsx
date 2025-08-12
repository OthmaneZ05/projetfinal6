"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      setHasValue(e.target.value !== "")
    }

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "peer w-full rounded-lg border border-input bg-background px-3 pt-6 pb-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            className,
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={label}
          {...props}
        />
        <label
          className={cn(
            "absolute left-3 top-4 text-sm text-muted-foreground transition-all duration-200 pointer-events-none",
            "peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted-foreground",
            "peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary",
            (focused || hasValue) && "top-2 text-xs text-primary",
            error && "text-red-500",
          )}
        >
          {label}
        </label>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)
FloatingLabelInput.displayName = "FloatingLabelInput"

export { FloatingLabelInput }
