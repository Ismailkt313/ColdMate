"use client";

import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { CompanyService } from "../../services/company.service";
import { Button } from "../ui/button";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  onSuccess: () => void;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  companyId,
  companyName,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await CompanyService.deleteCompany(companyId);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to delete company");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div className="relative w-full max-w-md bg-card text-card-foreground border border-border/80 rounded-xl shadow-lg p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md p-1.5 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-destructive/10 text-destructive rounded-full">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Delete Company</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{companyName}"</span>?
              This action cannot be undone and all data, including AI research results, will be permanently removed.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border/50">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={loading}>
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
