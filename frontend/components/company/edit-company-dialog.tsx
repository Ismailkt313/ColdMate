"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";
import { ICompany } from "../../types/company";
import { CompanyService } from "../../services/company.service";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FormLabel } from "../ui/form-label";
import { ErrorMessage } from "../ui/error-message";

const editCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  headquarters: z.string().optional(),
  country: z.string().optional(),
  foundedYear: z.string().optional(),
  careersPage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  glassdoor: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  techStackRaw: z.string().optional(),
  description: z.string().optional(),
  status: z.enum([
    "NOT_RESEARCHED",
    "RESEARCHING",
    "READY_TO_APPLY",
    "APPLIED",
    "INTERVIEW",
    "ASSESSMENT",
    "OFFER",
    "REJECTED",
    "GHOSTED",
    "ARCHIVED",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  notes: z.string().optional(),
  applicationDate: z.string().optional(),
});

type EditCompanyFields = z.infer<typeof editCompanySchema>;

interface EditCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  company: ICompany;
  onSuccess: () => void;
}

export function EditCompanyDialog({ isOpen, onClose, company, onSuccess }: EditCompanyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCompanyFields>({
    resolver: zodResolver(editCompanySchema),
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.manualData.name || "",
        website: company.manualData.website || "",
        industry: company.manualData.industry || "",
        companySize: company.manualData.companySize || "",
        headquarters: company.manualData.headquarters || "",
        country: company.manualData.country || "",
        foundedYear: company.manualData.foundedYear || "",
        careersPage: company.manualData.careersPage || "",
        linkedin: company.manualData.linkedin || "",
        glassdoor: company.manualData.glassdoor || "",
        github: company.manualData.github || "",
        techStackRaw: company.manualData.techStack?.join(", ") || "",
        description: company.manualData.description || "",
        status: company.status || "NOT_RESEARCHED",
        priority: company.priority || "MEDIUM",
        notes: company.notes || "",
        applicationDate: company.applicationDate ? new Date(company.applicationDate).toISOString().split("T")[0] : "",
      });
    }
  }, [company, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: EditCompanyFields) => {
    setLoading(true);
    setError(null);
    try {
      const techStack = data.techStackRaw
        ? data.techStackRaw
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [];

      const payload = {
        name: data.name,
        website: data.website || "",
        industry: data.industry || "",
        companySize: data.companySize || "",
        headquarters: data.headquarters || "",
        country: data.country || "",
        foundedYear: data.foundedYear || "",
        careersPage: data.careersPage || "",
        linkedin: data.linkedin || "",
        glassdoor: data.glassdoor || "",
        github: data.github || "",
        techStack,
        description: data.description || "",
        status: data.status,
        priority: data.priority,
        notes: data.notes || "",
        applicationDate: data.applicationDate ? new Date(data.applicationDate).toISOString() : null,
      };

      const res = await CompanyService.updateCompany(company._id, payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to update company");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Content */}
      <div className="relative w-full max-w-2xl bg-card text-card-foreground border border-border/80 rounded-xl shadow-lg p-6 sm:p-8 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md p-1.5 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Edit Company Details</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Update manual company information and job application parameters.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FormLabel htmlFor="name">Company Name *</FormLabel>
              <Input id="name" error={!!errors.name} disabled={loading} {...register("name")} />
              <ErrorMessage message={errors.name?.message} />
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="website">Website</FormLabel>
              <Input id="website" placeholder="https://" error={!!errors.website} disabled={loading} {...register("website")} />
              <ErrorMessage message={errors.website?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <FormLabel htmlFor="industry">Industry</FormLabel>
              <Input id="industry" error={!!errors.industry} disabled={loading} {...register("industry")} />
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="companySize">Company Size</FormLabel>
              <Input id="companySize" placeholder="e.g. 100-500" error={!!errors.companySize} disabled={loading} {...register("companySize")} />
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="foundedYear">Founded Year</FormLabel>
              <Input id="foundedYear" error={!!errors.foundedYear} disabled={loading} {...register("foundedYear")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FormLabel htmlFor="headquarters">Headquarters</FormLabel>
              <Input id="headquarters" placeholder="City, State/Region" error={!!errors.headquarters} disabled={loading} {...register("headquarters")} />
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="country">Country</FormLabel>
              <Input id="country" error={!!errors.country} disabled={loading} {...register("country")} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/40 pt-4">
            <div className="space-y-1.5">
              <FormLabel htmlFor="careersPage">Careers Page URL</FormLabel>
              <Input id="careersPage" placeholder="https://" error={!!errors.careersPage} disabled={loading} {...register("careersPage")} />
              <ErrorMessage message={errors.careersPage?.message} />
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="linkedin">LinkedIn Page URL</FormLabel>
              <Input id="linkedin" placeholder="https://" error={!!errors.linkedin} disabled={loading} {...register("linkedin")} />
              <ErrorMessage message={errors.linkedin?.message} />
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="github">GitHub Organization URL</FormLabel>
              <Input id="github" placeholder="https://" error={!!errors.github} disabled={loading} {...register("github")} />
              <ErrorMessage message={errors.github?.message} />
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="glassdoor">Glassdoor URL</FormLabel>
              <Input id="glassdoor" placeholder="https://" error={!!errors.glassdoor} disabled={loading} {...register("glassdoor")} />
              <ErrorMessage message={errors.glassdoor?.message} />
            </div>
          </div>

          <div className="space-y-1.5 border-t border-border/40 pt-4">
            <FormLabel htmlFor="techStackRaw">Tech Stack (comma separated)</FormLabel>
            <Input id="techStackRaw" placeholder="React, Node.js, TypeScript, Docker" error={!!errors.techStackRaw} disabled={loading} {...register("techStackRaw")} />
          </div>

          <div className="space-y-1.5">
            <FormLabel htmlFor="description">Description</FormLabel>
            <textarea
              id="description"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/40 pt-4">
            <div className="space-y-1.5">
              <FormLabel htmlFor="status">Application Status</FormLabel>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40"
                disabled={loading}
                {...register("status")}
              >
                <option value="NOT_RESEARCHED">Not Researched</option>
                <option value="RESEARCHING">Researching</option>
                <option value="READY_TO_APPLY">Ready to Apply</option>
                <option value="APPLIED">Applied</option>
                <option value="INTERVIEW">Interviewing</option>
                <option value="ASSESSMENT">Assessment</option>
                <option value="OFFER">Offer Received</option>
                <option value="REJECTED">Rejected</option>
                <option value="GHOSTED">Ghosted</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="priority">Priority</FormLabel>
              <select
                id="priority"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40"
                disabled={loading}
                {...register("priority")}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="applicationDate">Application Date</FormLabel>
              <Input id="applicationDate" type="date" error={!!errors.applicationDate} disabled={loading} {...register("applicationDate")} />
              <ErrorMessage message={errors.applicationDate?.message} />
            </div>
          </div>

          <div className="space-y-1.5">
            <FormLabel htmlFor="notes">Personal Notes / Thoughts</FormLabel>
            <textarea
              id="notes"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-border/50">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
