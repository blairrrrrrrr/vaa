import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const variantClasses = {
      default: "btn btn-primary",
      destructive: "btn btn-danger",
      outline: "btn btn-outline-primary",
      secondary: "btn btn-secondary",
      ghost: "btn btn-link",
      link: "btn btn-link",
    }
    
    const sizeClasses = {
      default: "",
      sm: "btn-sm",
      lg: "btn-lg",
      icon: "",
    }
    
    const iconStyle = size === "icon" ? { width: "36px", height: "36px", padding: "0" } : {}
    
    return (
      <Comp
        className={`${variantClasses[variant]} ${sizeClasses[size]} ${className || ""}`}
        style={iconStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
