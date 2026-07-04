import React from "react";

export function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[12px] font-medium text-destructive transition-all mt-1.5" role="alert">
      {message}
    </p>
  );
}
