"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Briefcase,
  Terminal,
  Activity,
  Layers,
  Cpu,
  User,
  CheckCircle,
  AlertCircle,
  Search,
  Check,
  Globe,
  Database,
  Code2,
} from "lucide-react";
import { AuthService } from "../services/auth.service";
import { Logo } from "../components/ui/logo";
import { ThemeToggle } from "../components/ui/theme-toggle";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await AuthService.me();
        if (res.success && res.data.user) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkSession();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      
      {/* HEADER NAV */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md fixed top-0 left-0 right-0 w-full z-50 animate-fade-in">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 select-none">
              <Logo className="w-5 h-5 text-foreground" />
              <span className="font-bold text-sm tracking-tight">ColdMate</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <a href="#problem" className="hover:text-foreground transition-colors">Why ColdMate</a>
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a>
              <a href="#workflow" className="hover:text-foreground transition-colors">AI Workflow</a>
              <a href="#roadmap" className="hover:text-foreground transition-colors">Roadmap</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {checkingAuth ? (
              <div className="h-8 w-20 bg-secondary animate-pulse rounded-md" />
            ) : isAuthenticated ? (
              <Link href="/companies">
                <button className="inline-flex items-center justify-center gap-1.5 text-xs text-foreground font-semibold h-9 px-3.5 bg-secondary border border-border/80 rounded-md hover:bg-accent transition-colors cursor-pointer">
                  Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors h-9 px-3 cursor-pointer">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="inline-flex items-center justify-center text-xs text-primary-foreground font-semibold h-9 px-3.5 bg-primary rounded-md hover:opacity-90 transition-opacity cursor-pointer shadow-sm">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Spacer to prevent fixed header from overlapping hero content */}
      <div className="h-16 w-full shrink-0" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-10 pb-16 px-6 max-w-6xl mx-auto w-full text-center space-y-8">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] sm:h-[450px] sm:w-[450px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[80px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-bold tracking-tight animate-fade-in shadow-sm select-none">
          <Sparkles className="h-3.5 w-3.5" /> AI-Powered Application Intelligence
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto bg-clip-text text-foreground">
          Accelerate your cold application pipeline with <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">autonomous AI research</span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Stop manually entering company parameters. ColdMate parses your target stack, researches companies in real-time using Groq Llama-3.3, and organizes pipelines instantly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {checkingAuth ? (
            <div className="h-10 w-32 bg-secondary animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            <Link href="/companies">
              <button className="inline-flex items-center justify-center gap-2 text-xs text-primary-foreground font-bold h-10 px-5 bg-primary rounded-md hover:opacity-95 transition-opacity cursor-pointer shadow-md">
                Launch Platform Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <button className="inline-flex items-center justify-center gap-2 text-xs text-primary-foreground font-bold h-10 px-5 bg-primary rounded-md hover:opacity-95 transition-opacity cursor-pointer shadow-md">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <a href="#features">
                <button className="inline-flex items-center justify-center text-xs text-foreground font-bold h-10 px-5 border border-border/80 rounded-md bg-card hover:bg-accent transition-colors cursor-pointer">
                  Explore Features
                </button>
              </a>
            </>
          )}
        </div>

        {/* Premium Dashboard Preview Mock */}
        <div className="pt-10 max-w-4xl mx-auto w-full animate-in fade-in-50 slide-in-from-bottom-5 duration-700">
          <div className="relative rounded-2xl border border-border/50 bg-card p-4 sm:p-5 shadow-2xl overflow-hidden text-left">
            {/* Header bar mock */}
            <div className="flex items-center justify-between pb-4 border-b border-border/30 mb-4 select-none">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="text-[10px] text-muted-foreground font-mono ml-2">https://app.coldmate.ai/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">AI Connected</span>
              </div>
            </div>

            {/* Grid preview mock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-4">
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Netflix Research Report</span>
                    <span className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase">Completed</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Netflix operates a global media platform. Primary technology stack includes React, Node.js, Java, AWS, and Cassandra. Active engineering teams focus on cloud automation, media encoding pipelines, and content discovery algorithms.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["React", "Node.js", "AWS", "Docker", "Cassandra"].map((tech, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-card text-[9px] border border-border/40 font-semibold">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/40 bg-secondary/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Stripe Interview Focus</span>
                    <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase font-mono">Hiring</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Researching Stripe's hiring policies. Tech Stack: Ruby, Go, TypeScript, React, AWS. General engineering focus on low-latency payment integrations, ledger accounting, and developer tooling scaling.
                  </p>
                </div>
              </div>

              {/* Sidebar stats mockup */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-border/40 bg-secondary/10 space-y-3">
                  <span className="text-xs font-bold text-foreground">Pipeline Status</span>
                  <div className="space-y-2 text-[11px] font-semibold">
                    <div className="flex justify-between items-center text-purple-500">
                      <span>Ready to Apply</span>
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/10 border border-purple-500/20">8</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-500">
                      <span>Applied</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">14</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-500">
                      <span>Interviews</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">4</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/40 bg-secondary/10 text-center space-y-2">
                  <span className="text-2xl font-black text-foreground">92%</span>
                  <p className="text-[10px] text-muted-foreground font-medium leading-normal">Average confidence rate of parsed company tech stacks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM STATEMENT */}
      <section id="problem" className="border-t border-border/30 bg-secondary/10 py-16 px-6">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">The Challenge</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
              Why manual job tracking spreadsheets fail engineers
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Applying to companies in today's tech market requires precision. Sending identical resumes blind results in automated rejections. Yet, keeping spreadsheets updated, researching stacks, finding careers pages, and creating follow-up outreach manually takes hours of tedious, repetitive copying and pasting.
            </p>
            <div className="space-y-2.5 pt-2">
              {[
                "Application fatigue: hours spent filling database parameters manually.",
                "Zero intelligence: applying to teams without knowing their active stack.",
                "Outdated news: missing critical details about hiring freezes or funding rounds.",
              ].map((text, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground font-semibold">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border/40 bg-card space-y-4 shadow-sm">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" /> The ColdMate Remedy
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ColdMate replaces manual database creation with an **AI-First Wizard**. Provide a company name; our integrated Groq provider parses target details, aggregates careers sites, inspects stacks, and maps coordinates in 10 seconds. You verify details, overwrite where necessary, and save.
            </p>
            <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-xs flex gap-3">
              <span className="text-2xl select-none">💡</span>
              <p className="text-muted-foreground font-medium leading-relaxed">
                By automating company intelligence gathering, applicants increase response rates by tailoring outreach to matched tech stacks and relevant recent news.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT FEATURES */}
      <section id="features" className="py-16 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Platform Features</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">Engineered for data-driven applicants</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            A comprehensive suite designed to clean, extract, research, and organize your applications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border/40 bg-card hover:border-primary/30 transition-all duration-300 space-y-4 group">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Terminal className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground">AI Resume Parsing</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload multiple PDF or DOCX resumes. Our parser verifies file structures and extracts your skills, achievements, and educational history instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/40 bg-card hover:border-primary/30 transition-all duration-300 space-y-4 group">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Cpu className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Groq-Powered Research</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Live lookup of target entities. Automatically discovers Glassdoor, LinkedIn, headquarters location, hiring state, tech stack lists, and recent news.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/40 bg-card hover:border-primary/30 transition-all duration-300 space-y-4 group">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-foreground">CRM Pipeline Wizard</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Configure priorities, statuses, and custom instructions. Filter target firms by response dates, keep overrides separate from raw data, and track communications.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SYSTEM ARCHITECTURE */}
      <section id="architecture" className="border-t border-border/30 bg-secondary/15 py-16 px-6">
        <div className="max-w-6xl mx-auto w-full space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Platform Infrastructure</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">Decoupled Scalable Architecture</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Built on clean patterns to decouple interface actions from database writes and external AI providers.
            </p>
          </div>

          {/* Visual Architecture Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto w-full pt-4">
            <div className="p-4 rounded-xl border border-border/40 bg-card text-center space-y-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Globe className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground block">Client View</span>
              <p className="text-[10px] text-muted-foreground leading-normal">Next.js 14 SPA. Form controllers, dialog overlays, theme variables.</p>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-card text-center space-y-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground block">API Gateway</span>
              <p className="text-[10px] text-muted-foreground leading-normal">Express.js router. CORS protocols, rate-limit systems, JWT authentication claims.</p>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-card text-center space-y-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Cpu className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground block">AIService Layer</span>
              <p className="text-[10px] text-muted-foreground leading-normal">Unified provider wrapper. Implements Groq API mode via LLama-3.3-70b completion.</p>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-card text-center space-y-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Database className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground block">Database Store</span>
              <p className="text-[10px] text-muted-foreground leading-normal">MongoDB cluster. Decouples manual overrides from unmodified raw AI structures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI + AUTOMATION WORKFLOW */}
      <section id="workflow" className="py-16 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Automation Pipeline</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">How ColdMate simplifies applications</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            From raw inputs to structured analytics reports in exactly four execution cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          {[
            { step: "01", title: "Upload Resume", desc: "Upload CV documents. AI analyzes validity, parses structures, and logs profile variables." },
            { step: "02", title: "Name Company", desc: "Type company name and website. Collapsible options let you prioritize job URLs and focus areas." },
            { step: "03", title: "Groq Research", desc: "System sends request to Groq API. Automatically maps stack, careers link, size, and recent news." },
            { step: "04", title: "Edit & Tracker", desc: "Verify coordinates, apply manual overrides, assign priority/date details, and commit to pipeline." }
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl border border-border/40 bg-card space-y-3">
              <span className="absolute -top-3 left-4 px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-black">{item.step}</span>
              <h4 className="text-xs font-bold text-foreground pt-2">{item.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TECHNOLOGY STACK */}
      <section className="bg-secondary/10 py-12 px-6 border-t border-b border-border/30">
        <div className="max-w-6xl mx-auto w-full text-center space-y-6">
          <h3 className="text-[11px] font-bold text-primary uppercase tracking-widest">Built On Production-Grade Technologies</h3>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { name: "Next.js 14", category: "Frontend Framework" },
              { name: "Tailwind CSS", category: "Design System" },
              { name: "TypeScript", category: "Language Standards" },
              { name: "Node.js & Express", category: "Backend Engine" },
              { name: "MongoDB & Mongoose", category: "Data Cluster" },
              { name: "Groq API Llama-3.3", category: "AI provider" },
              { name: "React Hook Form", category: "Controller state" },
              { name: "Axios client", category: "Network requests" },
            ].map((tech, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card text-xs font-semibold"
              >
                <Code2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-foreground">{tech.name}</span>
                <span className="text-[9px] text-muted-foreground font-mono">({tech.category})</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 7. DEVELOPMENT ROADMAP */}
      <section id="roadmap" className="py-16 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Platform Evolution</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">Development Roadmap</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Upcoming feature releases scheduled to expand tracking integrations and automation loops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
          {[
            { q: "Q1 2026", title: "Pre-Research Wizard", desc: "Refactored Add Company experience to perform Groq AI queries before creating MongoDB entries.", status: "COMPLETED" },
            { q: "Q2 2026", title: "Recruiter CRM", desc: "Integrate contact tracking profiles. Link recruiters, HR managers, and interviewers directly to companies.", status: "IN DEVELOPMENT" },
            { q: "Q3 2026", title: "Outreach Sequence", desc: "Integrated AI follow-up generator connecting directly to email endpoints for sequenced mail outreach.", status: "PLANNED" },
            { q: "Q4 2026", title: "Webhook Pipelines", desc: "Expose API endpoints and webhooks for integration with n8n, Make, and automated Slack updates.", status: "PLANNED" }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-border/40 bg-card space-y-3 relative overflow-hidden">
              <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black border ${item.status === "COMPLETED" ? "bg-green-500/10 border-green-500/20 text-green-500" : item.status === "IN DEVELOPMENT" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" : "bg-zinc-500/10 border-zinc-500/20 text-zinc-500"}`}>
                {item.status}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block font-bold">{item.q}</span>
              <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. ABOUT THE BUILDER */}
      <section className="bg-secondary/10 py-16 px-6 border-t border-border/30">
        <div className="max-w-3xl mx-auto w-full text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">The Creator</h2>
            <h3 className="text-2xl font-extrabold text-foreground">About the Builder</h3>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl border border-border/40 bg-card text-left flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-3 text-center sm:text-left">
              <h4 className="text-sm font-bold text-foreground">muhammad • Lead Engineer & Founder</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Focused on developing developer-centric AI tooling, workflow pipeline automations, and productivity interfaces. Created ColdMate to bridge the gap between heavy, complex job boards and fast, highly contextual data hubs for tech applicants.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs pt-1">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-semibold"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-semibold"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="border-t border-border/40 py-12 px-6 mt-auto bg-background">
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 select-none">
            <Logo className="w-5 h-5 text-foreground" />
            <span className="font-bold text-sm tracking-tight text-foreground">ColdMate</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/companies" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>

          <p className="text-[10px] text-muted-foreground font-medium">
            © {new Date().getFullYear()} ColdMate. All rights reserved. Decoupled AI application engine.
          </p>
        </div>
      </footer>
    </div>
  );
}
