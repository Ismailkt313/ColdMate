"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  Mail,
  Phone,
  AlertCircle,
  Shield,
} from "lucide-react";
import { ContactService } from "../../services/contact.service";
import { IContact } from "../../types/contact";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FormLabel } from "../ui/form-label";

const SEARCH_STEPS = [
  "Searching official website...",
  "Searching careers page...",
  "Searching contact page...",
  "Searching LinkedIn...",
  "Extracting contact information...",
  "Validating contacts...",
  "Scoring confidence...",
  "Preparing results...",
];

function Linkedin({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface DiscoverContactsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
}

export function DiscoverContactsDialog({ isOpen, onClose, companyId, onSuccess }: DiscoverContactsDialogProps) {
  const [step, setStep] = useState<"loading" | "review">("loading");
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [contacts, setContacts] = useState<Partial<IContact>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"standard" | "deep">("standard");
  const [noContactsFound, setNoContactsFound] = useState(false);

  // Cycle loading steps
  useEffect(() => {
    if (step !== "loading" || !isOpen) return;

    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => {
        if (prev < SEARCH_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, isOpen]);

  // Run discovery helper
  const runDiscovery = async (researchMode: "standard" | "deep") => {
    setStep("loading");
    setLoadingStepIndex(0);
    setError(null);
    setNoContactsFound(false);
    setContacts([]);
    setMode(researchMode);

    try {
      const res = await ContactService.discoverContacts(companyId, researchMode);
      if (res.success && res.data) {
        if (res.data.length === 0) {
          setNoContactsFound(true);
          setStep("review");
        } else {
          setContacts(res.data);
          // Wait slightly to let animation finish
          setTimeout(() => {
            setStep("review");
          }, 800);
        }
      } else {
        setError(res.message || "Failed to discover contacts.");
        setStep("review");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to execute AI contact discovery.");
      setStep("review");
    }
  };

  // Run discovery on initial dialog open
  useEffect(() => {
    if (!isOpen) return;
    runDiscovery("standard");
  }, [isOpen, companyId]);

  if (!isOpen) return null;

  const handleFieldChange = (index: number, field: keyof IContact, value: any) => {
    setContacts((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        return { ...c, [field]: value };
      })
    );

    // If making one preferred, toggle off others
    if (field === "isPreferred" && value === true) {
      setContacts((prev) =>
        prev.map((c, i) => (i === index ? c : { ...c, isPreferred: false }))
      );
    }
  };

  const handleDeleteContact = (index: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddManualContact = () => {
    setNoContactsFound(false); // remove fallback alert since we are manually inserting
    const newContact: Partial<IContact> = {
      fullName: "",
      jobTitle: "",
      department: "HR",
      email: "",
      phone: "",
      linkedin: "",
      sourceUrl: "",
      sourceType: "OTHER",
      confidenceScore: 100,
      validationStatus: "USER_VERIFIED",
      aiNotes: "Manually entered contact",
      isPreferred: contacts.length === 0, // preferred if first contact
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Local validation
    const seenEmails = new Set<string>();
    const seenLinkedins = new Set<string>();
    const seenNames = new Set<string>();

    for (let i = 0; i < contacts.length; i++) {
      const c = contacts[i];
      if (!c.fullName || c.fullName.trim().length === 0) {
        setError(`Contact #${i + 1} must have a valid full name.`);
        return;
      }

      const email = c.email?.trim();
      const linkedin = c.linkedin?.trim();
      const name = c.fullName.trim().toLowerCase();

      if (email) {
        if (seenEmails.has(email)) {
          setError(`Duplicate email detected in review list: "${email}".`);
          return;
        }
        seenEmails.add(email);
      }

      if (linkedin) {
        if (seenLinkedins.has(linkedin)) {
          setError(`Duplicate LinkedIn URL detected in review: "${linkedin}".`);
          return;
        }
        seenLinkedins.add(linkedin);
      }

      if (seenNames.has(name)) {
        setError(`Duplicate contact name: "${c.fullName}".`);
        return;
      }
      seenNames.add(name);
    }

    setSaving(true);
    try {
      const res = await ContactService.saveBatchContacts(companyId, contacts);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to save contacts.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to batch save contacts.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog container */}
      <div className="relative w-full max-w-4xl bg-card text-card-foreground border border-border/80 rounded-xl shadow-lg p-6 sm:p-8 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
        {step !== "loading" && !saving && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md p-1.5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* LOADING PROGRESS STATE */}
        {step === "loading" && (
          <div className="flex flex-col py-10 items-center justify-center text-center space-y-6">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div>
              <h3 className="text-base font-bold text-foreground">Discovering Public Contacts</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Scanning target company subpages to harvest valid emails, phone numbers, and LinkedIn references...
              </p>
            </div>

            {/* Stepped progress tracker */}
            <div className="w-full max-w-md bg-secondary/20 border border-border/40 rounded-xl p-5 space-y-3 text-left">
              {SEARCH_STEPS.map((label, idx) => {
                const isCompleted = idx < loadingStepIndex;
                const isCurrent = idx === loadingStepIndex;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 transition-all duration-300 ${
                      isCompleted ? "opacity-100" : isCurrent ? "opacity-100 font-semibold animate-pulse" : "opacity-40"
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

        {/* REVIEW SCREEN STATE */}
        {step === "review" && (
          <div>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Review Discovered Contacts
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Inspect the scraped public records. Edit parameters or add manual overrides before saving.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddManualContact}
                className="gap-1.5 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Add Manual Contact
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Empty results fallback alert */}
            {noContactsFound ? (
              <div className="p-8 text-center space-y-5 border border-border/40 rounded-xl bg-secondary/10">
                <AlertCircle className="h-10 w-10 text-amber-500/80 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    No publicly available recruiting contacts were found for this company.
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Try searching a wider collection of pages via Deep Research or fill details manually.
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <Button type="button" variant="outline" size="sm" onClick={handleAddManualContact}>
                    Add Contact Manually
                  </Button>
                  {mode !== "deep" && (
                    <Button type="button" size="sm" onClick={() => runDiscovery("deep")} className="gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Try Deep Research
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveAll} className="space-y-4">
                <div className="border border-border/40 rounded-xl overflow-hidden divide-y divide-border/30 max-h-[50vh] overflow-y-auto bg-secondary/5">
                  {contacts.map((contact, idx) => {
                    const isLowConfidence = (contact.confidenceScore ?? 100) < 70;
                    return (
                      <div
                        key={idx}
                        className={`p-4 space-y-4 transition-colors ${
                          isLowConfidence ? "bg-amber-500/5 dark:bg-amber-500/[0.02]" : ""
                        }`}
                      >
                        {/* Title Row */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-muted-foreground select-none bg-secondary px-2 py-0.5 border border-border/40 rounded">
                              #{idx + 1}
                            </span>
                            {isLowConfidence && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase">
                                <AlertCircle className="h-3 w-3" /> Low Confidence ({contact.confidenceScore}%)
                              </span>
                            )}
                            {contact.validationStatus === "AI_VALIDATED" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase">
                                <Shield className="h-3 w-3" /> AI Validated
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Preferred Toggle */}
                            <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold select-none cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!contact.isPreferred}
                                onChange={(e) => handleFieldChange(idx, "isPreferred", e.target.checked)}
                                className="h-3.5 w-3.5 rounded text-primary border-input cursor-pointer"
                              />
                              <span>Preferred Contact</span>
                            </label>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(idx)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-secondary transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Inline fields */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <FormLabel className="text-[10px]">Full Name *</FormLabel>
                            <Input
                              placeholder="e.g. Jane Smith"
                              value={contact.fullName || ""}
                              onChange={(e) => handleFieldChange(idx, "fullName", e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <FormLabel className="text-[10px]">Job Title</FormLabel>
                            <Input
                              placeholder="e.g. Lead Recruiter"
                              value={contact.jobTitle || ""}
                              onChange={(e) => handleFieldChange(idx, "jobTitle", e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <FormLabel className="text-[10px]">Department</FormLabel>
                            <select
                              value={contact.department || "HR"}
                              onChange={(e) => handleFieldChange(idx, "department", e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="HR">HR / Recruiting</option>
                              <option value="Engineering">Engineering</option>
                              <option value="Leadership">Leadership / Founders</option>
                              <option value="General">General / Support</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <FormLabel className="text-[10px]">Source Type</FormLabel>
                            <select
                              value={contact.sourceType || "OTHER"}
                              onChange={(e) => handleFieldChange(idx, "sourceType", e.target.value)}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="OFFICIAL_WEBSITE">Official Website</option>
                              <option value="CAREERS_PAGE">Careers Page</option>
                              <option value="LINKEDIN">LinkedIn</option>
                              <option value="PUBLIC_DIRECTORY">Public Directory</option>
                              <option value="PRESS_RELEASE">Press Release</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <FormLabel className="text-[10px] flex items-center gap-1"><Mail className="h-3 w-3" /> Email</FormLabel>
                            <Input
                              type="email"
                              placeholder="email@company.com"
                              value={contact.email || ""}
                              onChange={(e) => handleFieldChange(idx, "email", e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <FormLabel className="text-[10px] flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</FormLabel>
                            <Input
                              placeholder="+123..."
                              value={contact.phone || ""}
                              onChange={(e) => handleFieldChange(idx, "phone", e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <FormLabel className="text-[10px] flex items-center gap-1"><Linkedin className="h-3 w-3" /> LinkedIn URL</FormLabel>
                            <Input
                              placeholder="https://linkedin.com/in/..."
                              value={contact.linkedin || ""}
                              onChange={(e) => handleFieldChange(idx, "linkedin", e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Source URL & AI Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1 space-y-1">
                            <FormLabel className="text-[10px]">Source Reference URL</FormLabel>
                            <Input
                              placeholder="https://..."
                              value={contact.sourceUrl || ""}
                              onChange={(e) => handleFieldChange(idx, "sourceUrl", e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2 space-y-1">
                            <FormLabel className="text-[10px]">AI Insight Notes</FormLabel>
                            <Input
                              placeholder="Notes details..."
                              value={contact.aiNotes || ""}
                              onChange={(e) => handleFieldChange(idx, "aiNotes", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border/30">
                  {mode !== "deep" ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => runDiscovery("deep")} className="gap-1.5 text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Try Deep Research
                    </Button>
                  ) : (
                    <div className="text-[10px] text-muted-foreground italic">Deep research mode executed</div>
                  )}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                      Discard
                    </Button>
                    <Button type="submit" disabled={saving || contacts.length === 0}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                        </>
                      ) : (
                        "Save Contacts"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
