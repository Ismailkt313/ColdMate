import React from "react";

export function FormLabel({
  htmlFor,
  children,
  className = "",
}: {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none text-foreground select-none ${className}`}
    >
      {children}
    </label>
  );
}
