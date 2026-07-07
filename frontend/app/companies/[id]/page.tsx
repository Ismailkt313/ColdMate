"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Globe,
  Link2,
  MapPin,
  Users,
  Layers,
  Edit2,
  RefreshCw,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Bookmark,
  TrendingUp,
  UserCheck,
  Check,
  Briefcase,
} from "lucide-react";

function Github({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function Linkedin({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
import { ICompany, CompanyStatus, CompanyPriority } from "../../../types/company";
import { CompanyService } from "../../../services/company.service";
import { AuthService } from "../../../services/auth.service";
import { User } from "../../../types/auth";
import { Logo } from "../../../components/ui/logo";
import { ThemeToggle } from "../../../components/ui/theme-toggle";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { EditCompanyDialog } from "../../../components/company/edit-company-dialog";

type ActiveTab = "overview" | "ai" | "notes" | "contacts" | "outreach" | "activity";

export default function CompanyDetailsPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Core company data
  const [company, setCompany] = useState<ICompany | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Dialogs
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Notes state
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // Check auth
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await AuthService.me();
        if (res.success && res.data.user) {
          setUser(res.data.user);
        } else {
          router.push("/login");
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setLoadingSession(false);
      }
    }
    checkAuth();
  }, [router]);

  // Load details
  const fetchCompany = useCallback(async () => {
    try {
      const res = await CompanyService.getCompany(id);
      if (res.success && res.data) {
        setCompany(res.data);
        setNotes(res.data.notes || "");
      } else {
        setError(res.message || "Failed to load company details");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load company details");
    } finally {
      setLoadingCompany(false);
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchCompany();
    }
  }, [user, fetchCompany]);

  // Background polling for AI research status
  useEffect(() => {
    if (!company || !user) return;

    if (company.researchStatus === "PROCESSING" || company.researchStatus === "PENDING") {
      const interval = setInterval(() => {
        fetchCompany();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [company, user, fetchCompany]);

  const handleTriggerResearch = async () => {
    if (!company) return;
    try {
      setCompany({ ...company, researchStatus: "PROCESSING" });
      await CompanyService.triggerResearch(company._id);
      fetchCompany();
    } catch (err) {
      console.error("Failed to trigger research", err);
    }
  };

  const handleSaveNotes = async () => {
    if (!company) return;
    setSavingNotes(true);
    setNotesSuccess(false);
    try {
      const res = await CompanyService.updateCompany(company._id, { notes });
      if (res.success && res.data) {
        setCompany(res.data);
        setNotesSuccess(true);
        setTimeout(() => setNotesSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update notes", err);
    } finally {
      setSavingNotes(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: CompanyStatus) => {
    return status.replace(/_/g, " ");
  };

  const getResearchIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "PROCESSING":
        return <Loader2 className="h-4 w-4 text-sky-500 animate-spin" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loadingSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading session...</p>
      </div>
    );
  }

  if (!user) return null;

  if (loadingCompany) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Loading company details...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <h2 className="text-lg font-bold text-foreground">Error Loading Company</h2>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          {error || "The company you are looking for does not exist or you do not have permission."}
        </p>
        <Link href="/companies" className="mt-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Companies
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-md fixed top-0 left-0 right-0 w-full z-50 animate-fade-in">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 select-none cursor-pointer">
              <Logo className="w-5 h-5 text-foreground" />
              <span className="font-semibold text-sm tracking-tight text-foreground">ColdMate</span>
            </Link>
            <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Profile & Resumes
              </Link>
              <Link href="/companies" className="text-foreground transition-colors border-b border-foreground pb-0.5">
                Companies
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/companies">
              <Button size="sm" variant="outline" className="h-9 text-xs">
                Back to List
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent fixed navbar from overlapping details content */}
      <div className="h-14 w-full shrink-0" />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Breadcrumb Back Link */}
        <Link href="/companies" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Target Companies
        </Link>

        {/* Company Jumbotron Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-secondary/40 border border-border/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center font-bold text-white text-2xl shadow-sm shrink-0">
              {company.manualData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {company.manualData.name}
                </h1>
                {company.manualData.website && (
                  <a
                    href={company.manualData.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {company.manualData.industry || "No industry category specified"} • {company.manualData.headquarters || "No location info"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* AI Research Status */}
            <div className="flex items-center gap-2 bg-background border border-border/50 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground font-medium select-none shadow-sm">
              {getResearchIcon(company.researchStatus)}
              <span className="capitalize">AI research {company.researchStatus.toLowerCase()}</span>
            </div>

            <Button onClick={() => setIsEditOpen(true)} variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <Edit2 className="h-3.5 w-3.5" /> Edit Details
            </Button>

            {company.researchStatus !== "PROCESSING" && (
              <Button onClick={handleTriggerResearch} variant="outline" size="sm" className="gap-1.5 h-9 text-xs text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40">
                <RefreshCw className="h-3.5 w-3.5" />
                {company.researchStatus === "COMPLETED" ? "Refresh AI Research" : "Analyze with Grok AI"}
              </Button>
            )}
          </div>
        </div>

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Tabs Menu Column */}
          <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-border/40 shrink-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-primary text-primary-foreground font-bold shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Building2 className="h-4 w-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === "ai"
                  ? "bg-primary text-primary-foreground font-bold shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Sparkles className="h-4 w-4" /> AI Research
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === "notes"
                  ? "bg-primary text-primary-foreground font-bold shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <FileText className="h-4 w-4" /> Notes & Thoughts
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className="flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-lg text-muted-foreground/60 cursor-not-allowed whitespace-nowrap"
              disabled
            >
              <Users className="h-4 w-4" /> Contacts <span className="text-[8px] bg-secondary text-muted-foreground px-1 py-0.2 rounded border border-border/40">Soon</span>
            </button>
            <button
              onClick={() => setActiveTab("outreach")}
              className="flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-lg text-muted-foreground/60 cursor-not-allowed whitespace-nowrap"
              disabled
            >
              <Globe className="h-4 w-4" /> Outreach <span className="text-[8px] bg-secondary text-muted-foreground px-1 py-0.2 rounded border border-border/40">Soon</span>
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className="flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-lg text-muted-foreground/60 cursor-not-allowed whitespace-nowrap"
              disabled
            >
              <TrendingUp className="h-4 w-4" /> Activity <span className="text-[8px] bg-secondary text-muted-foreground px-1 py-0.2 rounded border border-border/40">Soon</span>
            </button>
          </div>

          {/* Tab Content Display Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card>
                  <div className="mb-4 pb-3 border-b border-border/40">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-primary" /> Application Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</span>
                      <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {getStatusLabel(company.status)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Priority</span>
                      <div className="text-sm font-semibold text-foreground">
                        {company.priority} Priority
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Application Date</span>
                      <div className="text-sm font-semibold text-foreground">
                        {formatDate(company.applicationDate)}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="mb-4 pb-3 border-b border-border/40">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" /> Company Profile
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {company.manualData.description ? (
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Description</span>
                          <p className="text-xs text-foreground leading-relaxed">{company.manualData.description}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No manual description provided.</p>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Industry</span>
                          <p className="text-xs font-semibold text-foreground">{company.manualData.industry || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Founded Year</span>
                          <p className="text-xs font-semibold text-foreground">{company.manualData.foundedYear || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Company Size</span>
                          <p className="text-xs font-semibold text-foreground">{company.manualData.companySize || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Country</span>
                          <p className="text-xs font-semibold text-foreground">{company.manualData.country || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Resources Links Grid */}
                    <div className="space-y-4 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6">
                      <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Resources & Links</h4>
                      <div className="space-y-2.5">
                        {company.manualData.website && (
                          <a
                            href={company.manualData.website}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline"
                          >
                            <Globe className="h-3.5 w-3.5" /> Main Website
                          </a>
                        )}
                        {company.manualData.careersPage && (
                          <a
                            href={company.manualData.careersPage}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline"
                          >
                            <Link2 className="h-3.5 w-3.5" /> Careers page
                          </a>
                        )}
                        {company.manualData.linkedin && (
                          <a
                            href={company.manualData.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline"
                          >
                            <Linkedin className="h-3.5 w-3.5" /> LinkedIn Profile
                          </a>
                        )}
                        {company.manualData.github && (
                          <a
                            href={company.manualData.github}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline"
                          >
                            <Github className="h-3.5 w-3.5" /> GitHub Profile
                          </a>
                        )}
                        {company.manualData.glassdoor && (
                          <a
                            href={company.manualData.glassdoor}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline"
                          >
                            <Briefcase className="h-3.5 w-3.5" /> Glassdoor
                          </a>
                        )}
                        {!company.manualData.website &&
                          !company.manualData.careersPage &&
                          !company.manualData.linkedin &&
                          !company.manualData.github &&
                          !company.manualData.glassdoor && (
                            <p className="text-xs text-muted-foreground italic">No resource URLs added.</p>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Manual Tech Stack */}
                  {company.manualData.techStack && company.manualData.techStack.length > 0 && (
                    <div className="border-t border-border/40 pt-4 mt-6">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">Manual Tech Stack</span>
                      <div className="flex flex-wrap gap-1.5">
                        {company.manualData.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="inline-flex text-xs bg-primary/8 text-primary font-semibold px-2 py-0.5 rounded border border-primary/10"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* AI RESEARCH TAB */}
            {activeTab === "ai" && (
              <div className="space-y-6">
                {company.researchStatus === "PENDING" && (
                  <Card className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    <h3 className="font-bold text-sm text-foreground">AI Intelligence Research Pending</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Grok AI has not yet researched this company. Click analyze to trigger structured research.
                    </p>
                    <Button onClick={handleTriggerResearch} size="sm" className="gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Analyze Company
                    </Button>
                  </Card>
                )}

                {company.researchStatus === "PROCESSING" && (
                  <Card className="flex flex-col items-center justify-center p-16 text-center space-y-4">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <h3 className="font-bold text-sm text-foreground">Grok AI is Researching...</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      We are currently querying Grok AI to retrieve company summaries, stack info, latest news, and metadata. This page will update automatically when done.
                    </p>
                  </Card>
                )}

                {company.researchStatus === "FAILED" && (
                  <Card className="flex flex-col items-center justify-center p-12 text-center space-y-4 border-destructive/20 bg-destructive/5">
                    <AlertCircle className="h-8 w-8 text-destructive animate-bounce" />
                    <h3 className="font-bold text-sm text-foreground text-destructive">Research Execution Failed</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      The AI provider was unable to generate structured JSON results. Check your Grok API configurations and rate limits.
                    </p>
                    <Button onClick={handleTriggerResearch} variant="outline" size="sm" className="gap-1.5 border-destructive/20 hover:bg-destructive/5 text-destructive">
                      <RefreshCw className="h-3.5 w-3.5" /> Try Research Again
                    </Button>
                  </Card>
                )}

                {company.researchStatus === "COMPLETED" && company.aiResearch && (
                  <div className="space-y-6">
                    {/* Confidence & Quick Metrics */}
                    <Card className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                          <div>
                            <h4 className="text-sm font-bold text-foreground">Grok AI Research Results</h4>
                            <p className="text-[10px] text-muted-foreground">Researched on {formatDate(company.researchedAt)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto bg-secondary/30 p-2 sm:p-0 rounded border border-border/30 sm:border-0 sm:bg-transparent">
                          <div className="grow sm:grow-0 text-right">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Confidence Score</span>
                            <span className="text-sm font-extrabold text-foreground">{company.aiResearch.confidence}%</span>
                          </div>
                          {/* Confidence Bar */}
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${company.aiResearch.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* AI Summary */}
                    <Card>
                      <div className="mb-4 pb-3 border-b border-border/40">
                        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-primary" /> AI Summary & Description
                        </h3>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                        {company.aiResearch.companySummary || "No AI description generated."}
                      </p>
                    </Card>

                    {/* Meta Profile Info */}
                    <Card>
                      <div className="mb-4 pb-3 border-b border-border/40">
                        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-primary" /> Key Details
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Industry</span>
                          <p className="text-xs font-semibold text-foreground">{company.aiResearch.industry || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Company Size</span>
                          <p className="text-xs font-semibold text-foreground">{company.aiResearch.companySize || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Founded Year</span>
                          <p className="text-xs font-semibold text-foreground">{company.aiResearch.foundedYear || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Headquarters</span>
                          <p className="text-xs font-semibold text-foreground">{company.aiResearch.headquarters || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Country</span>
                          <p className="text-xs font-semibold text-foreground">{company.aiResearch.country || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Hiring Status</span>
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${
                              company.aiResearch.hiringStatus?.toLowerCase().includes("active")
                                ? "bg-emerald-500"
                                : company.aiResearch.hiringStatus?.toLowerCase().includes("freeze")
                                ? "bg-rose-500"
                                : "bg-zinc-500"
                            }`} />
                            {company.aiResearch.hiringStatus || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* AI Researched Tech Stack */}
                    {company.aiResearch.techStack && company.aiResearch.techStack.length > 0 && (
                      <Card>
                        <div className="mb-4 pb-3 border-b border-border/40">
                          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-primary" /> Inferred Tech Stack
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {company.aiResearch.techStack.map((tech, idx) => (
                            <span
                              key={idx}
                              className="inline-flex text-xs bg-secondary/80 text-muted-foreground font-semibold px-2 py-0.5 rounded border border-border/30"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Recent News Grid */}
                    {company.aiResearch.recentNews && company.aiResearch.recentNews.length > 0 && (
                      <Card>
                        <div className="mb-4 pb-3 border-b border-border/40">
                          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4 text-primary" /> Recent News & Updates
                          </h3>
                        </div>
                        <ul className="space-y-2.5">
                          {company.aiResearch.recentNews.map((newsItem, idx) => (
                            <li key={idx} className="text-xs text-foreground flex items-start gap-2 leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              {newsItem}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {/* Resource URLs */}
                    <Card>
                      <div className="mb-4 pb-3 border-b border-border/40">
                        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <Globe className="h-4 w-4 text-primary" /> AI Researched Links
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {company.aiResearch.website && (
                          <a
                            href={company.aiResearch.website}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline truncate"
                          >
                            <Globe className="h-3.5 w-3.5" /> Website
                          </a>
                        )}
                        {company.aiResearch.careersPage && (
                          <a
                            href={company.aiResearch.careersPage}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline truncate"
                          >
                            <Link2 className="h-3.5 w-3.5" /> Careers
                          </a>
                        )}
                        {company.aiResearch.linkedin && (
                          <a
                            href={company.aiResearch.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline truncate"
                          >
                            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                          </a>
                        )}
                        {company.aiResearch.github && (
                          <a
                            href={company.aiResearch.github}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline truncate"
                          >
                            <Github className="h-3.5 w-3.5" /> GitHub
                          </a>
                        )}
                        {company.aiResearch.glassdoor && (
                          <a
                            href={company.aiResearch.glassdoor}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline truncate"
                          >
                            <Briefcase className="h-3.5 w-3.5" /> Glassdoor
                          </a>
                        )}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === "notes" && (
              <Card>
                <div className="mb-4 pb-3 border-b border-border/40 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" /> Application Notes & Planning
                  </h3>
                  {notesSuccess && (
                    <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                      <Check className="h-3 w-3" /> Saved successfully
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Store details about key contacts, outreach strategies, email follow-up timelines, or interview schedules.
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Type details about this company application..."
                    rows={8}
                    className="flex w-full rounded-lg border border-input bg-background p-4 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 leading-relaxed"
                    disabled={savingNotes}
                  />

                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSaveNotes} loading={savingNotes}>
                      Save Notes
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Edit Company Dialog */}
      <EditCompanyDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        company={company}
        onSuccess={fetchCompany}
      />
    </div>
  );
}
