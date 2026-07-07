"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Plus,
  Loader2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import { ICompany, CompanyStatus, CompanyPriority } from "../../types/company";
import { CompanyService } from "../../services/company.service";
import { AuthService } from "../../services/auth.service";
import { User } from "../../types/auth";
import { Logo } from "../../components/ui/logo";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { CreateCompanyDialog } from "../../components/company/create-company-dialog";
import { DeleteConfirmationDialog } from "../../components/company/delete-confirmation-dialog";

export default function CompaniesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Pagination & Filtering state
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string } | null>(null);

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

  // Load companies
  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    try {
      const res = await CompanyService.getCompanies({
        page,
        limit,
        search,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      if (res.success && res.data) {
        setCompanies(res.data.companies);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error("Failed to load companies", err);
    } finally {
      setLoadingCompanies(false);
    }
  }, [page, limit, search, statusFilter, priorityFilter]);

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user, fetchCompanies]);

  // Background polling for any PROCESSING/PENDING research companies
  useEffect(() => {
    if (!user || companies.length === 0) return;

    const hasProcessing = companies.some(
      (c) => c.researchStatus === "PROCESSING" || c.researchStatus === "PENDING"
    );

    if (hasProcessing) {
      const interval = setInterval(() => {
        fetchCompanies();
      }, 5000); // Poll every 5s if items are researching
      return () => clearInterval(interval);
    }
  }, [companies, user, fetchCompanies]);

  const handleSignOut = async () => {
    try {
      await AuthService.logout();
    } catch (err) {
      console.error("Sign out failed", err);
    } finally {
      router.push("/login");
    }
  };

  const getStatusBadgeClass = (status: CompanyStatus) => {
    switch (status) {
      case "NOT_RESEARCHED":
        return "bg-secondary text-secondary-foreground border-border";
      case "RESEARCHING":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "READY_TO_APPLY":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "APPLIED":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "INTERVIEW":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "ASSESSMENT":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "OFFER":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 font-bold";
      case "REJECTED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "GHOSTED":
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
      case "ARCHIVED":
        return "bg-neutral-500/10 text-neutral-500 border-neutral-500/20";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const getStatusText = (status: CompanyStatus) => {
    return status.replace(/_/g, " ");
  };

  const getPriorityBadgeClass = (priority: CompanyPriority) => {
    switch (priority) {
      case "HIGH":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "LOW":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const getResearchBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      case "PROCESSING":
        return "bg-sky-500/10 text-sky-500 border-sky-500/20 animate-pulse";
      case "COMPLETED":
        return "bg-teal-500/10 text-teal-500 border-teal-500/20";
      case "FAILED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-secondary text-secondary-foreground border-border";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRandomGradient = (name: string) => {
    const code = name.charCodeAt(0) || 0;
    const gradients = [
      "from-rose-500 to-orange-500",
      "from-amber-500 to-yellow-500",
      "from-emerald-500 to-teal-500",
      "from-cyan-500 to-blue-500",
      "from-indigo-500 to-purple-500",
      "from-pink-500 to-rose-500",
    ];
    return gradients[code % gradients.length];
  };

  const totalPages = Math.ceil(total / limit);

  if (loadingSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading session...</p>
      </div>
    );
  }

  if (!user) return null;

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
            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium h-9 px-3 hover:bg-accent border border-border/50 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent fixed navbar from overlapping target list content */}
      <div className="h-14 w-full shrink-0" />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Mobile Nav Links */}
        <div className="flex sm:hidden justify-center gap-6 border-b border-border/30 pb-4 text-xs font-semibold">
          <Link href="/dashboard" className="text-muted-foreground">
            Profile & Resumes
          </Link>

          <Link href="/companies" className="text-foreground border-b border-foreground pb-0.5">
            Companies
          </Link>
        </div>

        {/* Heading Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-secondary/40 border border-border/40">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" /> Target Companies
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Add and track companies you plan to apply to. Keep notes and utilize Grok AI intelligence.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 self-start sm:self-auto h-9 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Company
          </Button>
        </div>

        {/* Filters and Search Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card text-card-foreground border border-border/60 rounded-xl p-4 sm:p-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, industry, or tech stack..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40"
            >
              <option value="">All Statuses</option>
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

          <div className="flex gap-4">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {/* Company Grid List */}
        {loadingCompanies ? (
          <div className="flex flex-col items-center justify-center p-20 bg-card rounded-xl border border-border/50">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-card text-center rounded-xl border border-border/50 space-y-3">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-1">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">No companies found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {search || statusFilter || priorityFilter
                ? "No companies match your filters. Try adjusting your search query."
                : "You haven't added any target companies yet. Add your first target company to start tracking!"}
            </p>
            {!search && !statusFilter && !priorityFilter && (
              <Button onClick={() => setIsCreateOpen(true)} size="sm" className="mt-2">
                Add Company
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company._id} className="flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden">
                <div>
                  {/* Card Header Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Premium Logo Badge */}
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-br ${getRandomGradient(
                          company.manualData.name
                        )} flex items-center justify-center font-bold text-white text-base select-none shrink-0 shadow-sm`}
                      >
                        {company.manualData.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate max-w-[150px]">
                          {company.manualData.name}
                        </h3>
                        {company.manualData.industry ? (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {company.manualData.industry}
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground italic">No industry info</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                          company.status
                        )}`}
                      >
                        {getStatusText(company.status)}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(
                          company.priority
                        )}`}
                      >
                        {company.priority} Priority
                      </span>
                    </div>
                  </div>

                  {/* Summary / Tech Info */}
                  <div className="my-4 space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                      {company.manualData.description ||
                        company.aiResearch?.companySummary ||
                        "No summary available. Edit or run AI research to fetch data."}
                    </p>

                    {/* Meta info tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {company.manualData.techStack && company.manualData.techStack.length > 0 ? (
                        company.manualData.techStack.slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className="inline-flex text-[9px] bg-secondary/80 text-secondary-foreground font-semibold px-1.5 py-0.5 rounded"
                          >
                            {tech}
                          </span>
                        ))
                      ) : company.aiResearch?.techStack && company.aiResearch.techStack.length > 0 ? (
                        company.aiResearch.techStack.slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className="inline-flex text-[9px] bg-secondary/40 text-muted-foreground font-semibold px-1.5 py-0.5 rounded border border-border/30"
                          >
                            {tech} *
                          </span>
                        ))
                      ) : null}
                      {((company.manualData.techStack?.length || 0) > 3 || (company.aiResearch?.techStack?.length || 0) > 3) && (
                        <span className="text-[9px] text-muted-foreground font-semibold px-1.5 py-0.5">
                          +more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer details & Action Buttons */}
                <div className="border-t border-border/40 pt-3 mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span>Research:</span>
                      <span
                        className={`px-1.5 py-0.2 rounded border font-semibold ${getResearchBadgeClass(
                          company.researchStatus
                        )}`}
                      >
                        {company.researchStatus}
                      </span>
                    </div>
                    <div>Updated: {formatDate(company.updatedAt)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCompany({ id: company._id, name: company.manualData.name });
                        setIsDeleteOpen(true);
                      }}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 border-border/60 hover:border-destructive/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Link href={`/companies/${company._id}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs font-semibold px-2.5">
                        Details <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Panel */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-card text-card-foreground border border-border/60 rounded-xl p-4">
            <span className="text-xs text-muted-foreground">
              Showing page <span className="font-semibold text-foreground">{page}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span> ({total} total companies)
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <CreateCompanyDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchCompanies}
      />

      {selectedCompany && (
        <DeleteConfirmationDialog
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedCompany(null);
          }}
          companyId={selectedCompany.id}
          companyName={selectedCompany.name}
          onSuccess={fetchCompanies}
        />
      )}
    </div>
  );
}
