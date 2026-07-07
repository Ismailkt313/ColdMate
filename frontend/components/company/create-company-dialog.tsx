"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CheckCircle,
  Globe,
  Users,
  MapPin,
  FileText,
  AlertCircle,
} from "lucide-react";

function Linkedin({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

import { CompanyService } from "../../services/company.service";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FormLabel } from "../ui/form-label";
import { ErrorMessage } from "../ui/error-message";

const PRESETS = {
  roles: ["Backend Developer", "Frontend Developer", "Full Stack Developer", "AI Engineer", "Node.js Developer"],
  focusAreas: [
    "General Company",
    "Hiring Information",
    "Engineering Team",
    "Tech Stack",
    "Company Culture",
    "Interview Process",
    "Leadership",
    "Funding",
    "Recent News",
  ],
  technologies: ["Node.js", "React", "Next.js", "MongoDB", "PostgreSQL", "AWS", "Docker", "Redis", "TypeScript"],
};

const LOADING_STEPS = [
  "Researching company...",
  "Finding official website...",
  "Finding LinkedIn...",
  "Analyzing company...",
  "Finding careers page...",
  "Analyzing technology stack...",
  "Checking hiring status...",
  "Generating company summary...",
  "Collecting recent news...",
  "Preparing company profile...",
];

// Step 1: Input Validation
const step1Schema = z.object({
  name: z.string().min(1, "Company name is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  targetRole: z.string().optional(),
  jobUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  focus: z.string().optional(),
  customTech: z.string().optional(),
  instructions: z.string().optional(),
});

type Step1Fields = z.infer<typeof step1Schema>;

// Step 2: Review & Overrides Validation
const step2Schema = z.object({
  name: z.string().min(1, "Company name is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  headquarters: z.string().optional(),
  country: z.string().optional(),
  foundedYear: z.string().optional(),
  careersPage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  techStackRaw: z.string().optional(),
  companySummary: z.string().optional(),
  hiringStatus: z.string().optional(),
  recentNewsRaw: z.string().optional(),
  // User Personal Fields
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

type Step2Fields = z.infer<typeof step2Schema>;

interface CreateCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCompanyDialog({ isOpen, onClose, onSuccess }: CreateCompanyDialogProps) {
  // Wizard steps: 'input' | 'loading' | 'review'
  const [step, setStep] = useState<"input" | "loading" | "review">("input");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Store the raw original AI Research data (unmodified)
  const [originalAiData, setOriginalAiData] = useState<any>(null);

  // Step 1 Form
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    formState: { errors: errors1 },
    reset: reset1,
  } = useForm<Step1Fields>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
      website: "",
      targetRole: "",
      jobUrl: "",
      focus: "General Company",
      customTech: "",
      instructions: "",
    },
  });

  // Step 2 Form
  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    reset: reset2,
  } = useForm<Step2Fields>({
    resolver: zodResolver(step2Schema),
  });

  // Increment loading steps sequentially
  useEffect(() => {
    if (step !== "loading") return;
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen) return null;

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleStartResearch = async (data: Step1Fields) => {
    setStep("loading");
    setLoadingStepIndex(0);
    setError(null);

    try {
      // Collect techs
      const finalTechs = [...selectedTechs];
      if (data.customTech) {
        data.customTech
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0)
          .forEach((t) => {
            if (!finalTechs.includes(t)) finalTechs.push(t);
          });
      }

      const payload = {
        name: data.name,
        website: data.website || undefined,
        advancedOptions: {
          targetRole: data.targetRole || undefined,
          jobUrl: data.jobUrl || undefined,
          focus: data.focus || undefined,
          technologies: finalTechs.length > 0 ? finalTechs : undefined,
          instructions: data.instructions || undefined,
        },
      };

      const res = await CompanyService.analyzeCompany(payload);

      if (res.success && res.data) {
        const aiData = res.data;
        setOriginalAiData(aiData);

        // Pre-populate Step 2 Form (Review/Overrides)
        reset2({
          name: data.name,
          website: data.website || aiData.website || "",
          industry: aiData.industry || "",
          companySize: aiData.companySize || "",
          headquarters: aiData.headquarters || "",
          country: aiData.country || "",
          foundedYear: aiData.foundedYear || "",
          careersPage: aiData.careersPage || "",
          linkedin: aiData.linkedin || "",
          techStackRaw: aiData.techStack?.join(", ") || "",
          companySummary: aiData.companySummary || "",
          hiringStatus: aiData.hiringStatus || "",
          recentNewsRaw: aiData.recentNews?.join("\n") || "",
          status: "READY_TO_APPLY",
          priority: "MEDIUM",
          notes: "",
          applicationDate: new Date().toISOString().split("T")[0],
        });

        // Add a slight delay to let loader finalize
        setTimeout(() => {
          setStep("review");
        }, 800);
      } else {
        setError(res.message || "AI research failed.");
        setStep("input");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to complete AI research. Please check API configs.");
      setStep("input");
    }
  };

  const handleSaveCompany = async (data: Step2Fields) => {
    setError(null);
    try {
      const techStack = data.techStackRaw
        ? data.techStackRaw
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [];

      const recentNews = data.recentNewsRaw
        ? data.recentNewsRaw
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [];

      // Combine user edited overrides
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
        techStack,
        description: data.companySummary || "",
        status: data.status,
        priority: data.priority,
        notes: data.notes || "",
        applicationDate: data.applicationDate ? new Date(data.applicationDate).toISOString() : undefined,
        // original AI Data block (unchanged)
        aiResearch: originalAiData,
        researchStatus: "COMPLETED" as const,
      };

      const res = await CompanyService.createCompany(payload);
      if (res.success) {
        reset1();
        setSelectedTechs([]);
        setStep("input");
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to save company");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save company. Please try again.");
    }
  };

  const getRandomGradient = (name: string) => {
    const code = name.charCodeAt(0) || 0;
    const gradients = [
      "from-rose-500 to-orange-500",
      "from-amber-500 to-yellow-500",
      "from-emerald-500 to-teal-500",
      "from-cyan-500 to-blue-500",
      "from-indigo-500 to-purple-500",
    ];
    return gradients[code % gradients.length];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Content Container */}
      <div className="relative w-full max-w-2xl bg-card text-card-foreground border border-border/80 rounded-xl shadow-lg p-6 sm:p-8 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
        {step !== "loading" && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md p-1.5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* STEP 1: SIMPLE AI-FIRST INPUT */}
        {step === "input" && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" /> Research Target Company
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enter a company name. Groq AI will run live web analysis to populate full profiles, tech stacks, and career insights.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit1(handleStartResearch)} className="space-y-5">
              <div className="space-y-1.5">
                <FormLabel htmlFor="name">Company Name *</FormLabel>
                <Input id="name" placeholder="e.g. Netflix" error={!!errors1.name} {...register1("name")} />
                <ErrorMessage message={errors1.name?.message} />
              </div>

              <div className="space-y-1.5">
                <FormLabel htmlFor="website">Website (Optional)</FormLabel>
                <Input id="website" placeholder="e.g. https://netflix.com" error={!!errors1.website} {...register1("website")} />
                <ErrorMessage message={errors1.website?.message} />
              </div>

              {/* Advanced Options Collapse */}
              <div className="border-t border-border/30 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold py-1 cursor-pointer transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span>Advanced Research Context</span>
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-3 pl-1 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <FormLabel htmlFor="targetRole">Target Job Role</FormLabel>
                        <select
                          id="targetRole"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40"
                          {...register1("targetRole")}
                        >
                          <option value="">Choose a role...</option>
                          {PRESETS.roles.map((r, i) => (
                            <option key={i} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <FormLabel htmlFor="focus">Research Focus</FormLabel>
                        <select
                          id="focus"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40"
                          {...register1("focus")}
                        >
                          {PRESETS.focusAreas.map((f, i) => (
                            <option key={i} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <FormLabel htmlFor="jobUrl">Job Posting URL (Optional)</FormLabel>
                      <Input
                        id="jobUrl"
                        placeholder="https://..."
                        error={!!errors1.jobUrl}
                        {...register1("jobUrl")}
                      />
                      <ErrorMessage message={errors1.jobUrl?.message} />
                    </div>

                    {/* Pre-pills Tech Select */}
                    <div className="space-y-1.5">
                      <FormLabel>Prioritize Technologies</FormLabel>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {PRESETS.technologies.map((tech, idx) => {
                          const isSelected = selectedTechs.includes(tech);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleTech(tech)}
                              className={`px-2 py-0.8 rounded text-[10px] font-semibold border transition-all cursor-pointer select-none ${
                                isSelected
                                  ? "bg-primary/10 text-primary border-primary"
                                  : "bg-secondary text-secondary-foreground border-border/55 hover:bg-secondary/70"
                              }`}
                            >
                              {tech}
                            </button>
                          );
                        })}
                      </div>
                      <Input id="customTech" placeholder="Custom technologies (comma separated)..." {...register1("customTech")} />
                    </div>

                    <div className="space-y-1.5">
                      <FormLabel htmlFor="instructions">Research Instructions</FormLabel>
                      <textarea
                        id="instructions"
                        placeholder="e.g. Find startup structure. Focus on Node.js engineering managers. Prefer remote guidelines."
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40"
                        {...register1("instructions")}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-1.5">
                  <Sparkles className="h-4 w-4 shrink-0" /> Research Company
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 1.5: LOADING PROCESSOR SCREEN */}
        {step === "loading" && (
          <div className="flex flex-col py-10 items-center justify-center text-center space-y-6">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div>
              <h3 className="text-base font-bold text-foreground">Groq AI is analyzing target company</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Gathering website meta tags, social profiles, news feeds, and indexing technical capabilities...
              </p>
            </div>

            {/* Stepped progress indicators */}
            <div className="w-full max-w-md bg-secondary/20 border border-border/40 rounded-xl p-5 space-y-3.5 text-left">
              {LOADING_STEPS.map((label, idx) => {
                const isCompleted = idx < loadingStepIndex;
                const isCurrent = idx === loadingStepIndex;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 transition-all duration-300 ${
                      isCompleted ? "opacity-100" : isCurrent ? "opacity-100 font-semibold" : "opacity-40"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-sky-500 animate-spin shrink-0" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground ml-1.5 shrink-0" />
                    )}
                    <span className="text-xs text-foreground">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: REVIEW & SAVE SCREEN */}
        {step === "review" && (
          <div>
            <div className="mb-6 flex items-start gap-4">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getRandomGradient(originalAiData?.companySummary || "Co")} flex items-center justify-center font-bold text-white text-xl shadow shrink-0 select-none`}>
                {originalAiData?.industry ? originalAiData.industry.charAt(0) : "C"}
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-foreground">Review Company Profile</h2>
                <p className="text-xs text-muted-foreground">
                  Groq completed the research. Review discovered details, modify override inputs, and define tracking statuses.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit2(handleSaveCompany)} className="space-y-5">
              <div className="space-y-4 bg-secondary/10 border border-border/40 rounded-xl p-4 sm:p-5">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Discovered AI Data (Editable Overrides)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="review_name">Company Name</FormLabel>
                    <Input id="review_name" error={!!errors2.name} {...register2("name")} />
                  </div>
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="review_website">Website</FormLabel>
                    <Input id="review_website" error={!!errors2.website} {...register2("website")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="review_industry">Industry</FormLabel>
                    <Input id="review_industry" {...register2("industry")} />
                  </div>
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="review_size">Company Size</FormLabel>
                    <Input id="review_size" {...register2("companySize")} />
                  </div>
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="review_founded">Founded Year</FormLabel>
                    <Input id="review_founded" {...register2("foundedYear")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="review_hq">Headquarters</FormLabel>
                    <Input id="review_hq" {...register2("headquarters")} />
                  </div>
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="review_country">Country</FormLabel>
                    <Input id="review_country" {...register2("country")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="review_careers">Careers Page</FormLabel>
                    <Input id="review_careers" error={!!errors2.careersPage} {...register2("careersPage")} />
                  </div>
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="review_linkedin">LinkedIn URL</FormLabel>
                    <Input id="review_linkedin" error={!!errors2.linkedin} {...register2("linkedin")} />
                  </div>
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="review_hiring">Hiring Status</FormLabel>
                    <Input id="review_hiring" {...register2("hiringStatus")} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <FormLabel htmlFor="review_stack">Tech Stack (comma separated)</FormLabel>
                  <Input id="review_stack" {...register2("techStackRaw")} />
                </div>

                <div className="space-y-1.5">
                  <FormLabel htmlFor="review_summary">Company Summary</FormLabel>
                  <textarea
                    id="review_summary"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40 leading-relaxed"
                    {...register2("companySummary")}
                  />
                </div>

                <div className="space-y-1.5">
                  <FormLabel htmlFor="review_news">Recent News (line separated)</FormLabel>
                  <textarea
                    id="review_news"
                    rows={2}
                    placeholder="Headline 1&#10;Headline 2"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40 leading-relaxed"
                    {...register2("recentNewsRaw")}
                  />
                </div>
              </div>

              {/* Personal Fields Section */}
              <div className="space-y-4 bg-secondary/5 border border-border/20 rounded-xl p-4 sm:p-5">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Personal Tracking Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <FormLabel htmlFor="status">Application Status</FormLabel>
                    <select
                      id="status"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40"
                      {...register2("status")}
                    >
                      <option value="NOT_RESEARCHED">Not Researched</option>
                      <option value="RESEARCHING">Researching</option>
                      <option value="READY_TO_APPLY">Ready to Apply</option>
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEW">Interviewing</option>
                      <option value="ASSESSMENT">Assessment</option>
                      <option value="OFFER">Offer</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="GHOSTED">Ghosted</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <FormLabel htmlFor="priority">Priority</FormLabel>
                    <select
                      id="priority"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40"
                      {...register2("priority")}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <FormLabel htmlFor="appDate">Application Date</FormLabel>
                    <Input id="appDate" type="date" error={!!errors2.applicationDate} {...register2("applicationDate")} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <FormLabel htmlFor="notes">Notes / Application Plan</FormLabel>
                  <textarea
                    id="notes"
                    placeholder="Recruiter contact, dates, action plan..."
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40 leading-relaxed"
                    {...register2("notes")}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                <Button type="button" variant="outline" onClick={() => setStep("input")}>
                  Back
                </Button>
                <Button type="submit">
                  Save Company
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
