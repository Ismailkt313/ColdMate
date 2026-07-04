import React from "react";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-background relative selection:bg-primary selection:text-primary-foreground">
      <header className="flex justify-between items-center px-6 py-4 absolute top-0 w-full z-10">
        <div className="flex items-center gap-2">
          <Logo className="w-6 h-6 text-foreground" />
          <span className="font-semibold text-sm tracking-tight text-foreground select-none">ColdMate</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-6 pt-20 pb-16">
        <div className="w-full max-w-[400px] animate-fade-in">
          {children}
        </div>
      </main>

      <footer className="text-center py-6 text-[11px] text-muted-foreground select-none">
        &copy; {new Date().getFullYear()} ColdMate Inc. All rights reserved.
      </footer>
    </div>
  );
}
