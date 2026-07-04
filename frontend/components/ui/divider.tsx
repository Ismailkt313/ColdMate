import React from "react";

export function Divider({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/70" />
      </div>
      {children && (
        <div className="relative flex justify-center text-[10px] tracking-wider uppercase">
          <span className="bg-background px-3 text-muted-foreground font-semibold select-none">
            {children}
          </span>
        </div>
      )}
    </div>
  );
}
