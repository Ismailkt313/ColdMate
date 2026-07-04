"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, LogOut, Settings, Bell, MessageSquare, Check, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";

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
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Providers } from "./providers";
import { Logo } from "../components/ui/logo";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { FormLabel } from "../components/ui/form-label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ErrorMessage } from "../components/ui/error-message";
import { AuthService } from "../services/auth.service";
import { User } from "../types/auth";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  portfolio: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  preferredCommunication: z.enum(["email", "phone", "slack"]),
  followUpEnabled: z.boolean(),
  followUpAfterDays: z.number().int().min(1, "Must be at least 1 day"),
});

type ProfileFormFields = z.infer<typeof profileFormSchema>;

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormFields>({
    resolver: zodResolver(profileFormSchema),
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await AuthService.me();
        if (res.success && res.data.user) {
          setUser(res.data.user);
          reset({
            name: res.data.user.name,
            phone: res.data.user.phone || "",
            portfolio: res.data.user.portfolio || "",
            github: res.data.user.github || "",
            linkedin: res.data.user.linkedin || "",
            preferredCommunication: (res.data.user.preferredCommunication as any) || "email",
            followUpEnabled: res.data.user.followUpEnabled ?? true,
            followUpAfterDays: res.data.user.followUpAfterDays ?? 7,
          });
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router, reset]);

  const onUpdateProfile = async (data: ProfileFormFields) => {
    setUpdateError(null);
    setUpdateSuccess(null);
    setUpdating(true);

    try {
      const axiosRes = await require("../lib/axios").default.patch("/auth/profile", data);
      
      if (axiosRes.data?.success && axiosRes.data?.data?.user) {
        setUser(axiosRes.data.data.user);
        setUpdateSuccess("Profile updated successfully!");
        setTimeout(() => setUpdateSuccess(null), 3000);
      }
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.logout();
    } catch (err) {
      console.error("Sign out failed", err);
    } finally {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading dashboard session...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 w-full z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5 text-foreground" />
            <span className="font-semibold text-sm tracking-tight text-foreground select-none">ColdMate</span>
            <span className="text-[10px] bg-secondary text-secondary-foreground font-semibold px-2 py-0.5 rounded-full select-none ml-2 border border-border/40">Dashboard</span>
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

      {/* Main Panel */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Welcome Jumbotron */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-secondary/40 border border-border/40">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Welcome back, {user.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage your ColdMate integration settings, communications, and profile variables.</p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto bg-background/50 border border-border/40 rounded-full px-3 py-1 text-xs text-muted-foreground font-medium select-none">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Session authenticated
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings / Configuration Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Update your personal information and profile configurations.</CardDescription>
              </CardHeader>
              <CardContent>
                {updateError && (
                  <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                    {updateError}
                  </div>
                )}
                {updateSuccess && (
                  <div className="mb-4 p-3 rounded-md bg-green-500/10 border border-green-500/20 text-xs text-green-600 dark:text-green-400 font-medium">
                    {updateSuccess}
                  </div>
                )}

                <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <FormLabel htmlFor="name">Full Name</FormLabel>
                      <Input id="name" placeholder="Name" error={!!errors.name} disabled={updating} {...register("name")} />
                      <ErrorMessage message={errors.name?.message} />
                    </div>

                    <div className="space-y-1.5">
                      <FormLabel htmlFor="phone">Phone Number</FormLabel>
                      <Input id="phone" placeholder="+123 456 7890" error={!!errors.phone} disabled={updating} {...register("phone")} />
                      <ErrorMessage message={errors.phone?.message} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <FormLabel htmlFor="portfolio">Portfolio URL</FormLabel>
                      <Input id="portfolio" placeholder="https://portfolio.me" error={!!errors.portfolio} disabled={updating} {...register("portfolio")} />
                      <ErrorMessage message={errors.portfolio?.message} />
                    </div>

                    <div className="space-y-1.5">
                      <FormLabel htmlFor="github">GitHub link</FormLabel>
                      <Input id="github" placeholder="https://github.com/profile" error={!!errors.github} disabled={updating} {...register("github")} />
                      <ErrorMessage message={errors.github?.message} />
                    </div>

                    <div className="space-y-1.5">
                      <FormLabel htmlFor="linkedin">LinkedIn link</FormLabel>
                      <Input id="linkedin" placeholder="https://linkedin.com/in/profile" error={!!errors.linkedin} disabled={updating} {...register("linkedin")} />
                      <ErrorMessage message={errors.linkedin?.message} />
                    </div>
                  </div>

                  <div className="border-t border-border/40 pt-4 mt-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Communication Rules</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <FormLabel htmlFor="preferredCommunication">Channel</FormLabel>
                        <select
                          id="preferredCommunication"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={updating}
                          {...register("preferredCommunication")}
                        >
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="slack">Slack</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <FormLabel htmlFor="followUpAfterDays">Follow-up Days</FormLabel>
                        <Input
                          id="followUpAfterDays"
                          type="number"
                          error={!!errors.followUpAfterDays}
                          disabled={updating}
                          {...register("followUpAfterDays", { valueAsNumber: true })}
                        />
                        <ErrorMessage message={errors.followUpAfterDays?.message} />
                      </div>

                      <div className="flex items-center space-x-2 pt-6 sm:pt-7">
                        <input
                          id="followUpEnabled"
                          type="checkbox"
                          className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring transition-colors cursor-pointer"
                          disabled={updating}
                          {...register("followUpEnabled")}
                        />
                        <label
                          htmlFor="followUpEnabled"
                          className="text-xs font-semibold leading-none text-muted-foreground select-none cursor-pointer"
                        >
                          Enable Follow-ups
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border/40 mt-6">
                    <Button type="submit" loading={updating}>
                      Save settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* User Meta Summary Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Data</CardTitle>
                <CardDescription>Authentication claims of the current session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-secondary/35 border border-border/40 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-foreground uppercase">
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{user.name}</h4>
                    <p className="text-[11px] text-muted-foreground">Role: <span className="font-semibold text-primary">{user.role}</span></p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/30">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</span>
                    <span className="font-medium text-foreground">{user.email}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-border/30">
                    <span className="text-muted-foreground flex items-center gap-1.5"><UserIcon className="h-3.5 w-3.5" /> Verified Status</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${user.isEmailVerified ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"}`}>
                      {user.isEmailVerified ? "Verified" : "Pending"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-border/30">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Onboarding</span>
                    <span className="font-semibold text-foreground">{user.onboardingCompleted ? "Complete" : "Pending"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Secured interface link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">Click below to navigate to password reset operations.</p>
                <Link href="/reset-password">
                  <Button variant="outline" className="w-full text-xs h-8">
                    Go to change password
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
