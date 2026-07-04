import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={`flex h-9 w-full rounded-md border ${
          error
            ? "border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive"
            : "border-input focus-visible:ring-ring focus-visible:border-primary/40"
        } bg-background px-3 py-1 text-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
