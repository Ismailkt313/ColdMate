import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  className = "",
  variant = "default",
  size = "md",
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

  const variantStyles = {
    default: "bg-primary text-primary-foreground shadow hover:opacity-90",
    outline:
      "border border-border/80 bg-background shadow-sm hover:bg-secondary hover:text-secondary-foreground",
    secondary: "bg-secondary text-secondary-foreground shadow-sm hover:opacity-90",
    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90",
  };

  const sizeStyles = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 py-2",
    lg: "h-10 px-8 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
