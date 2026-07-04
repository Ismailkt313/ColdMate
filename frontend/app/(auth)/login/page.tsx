"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { PageContainer } from "../../../components/ui/page-container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";
import { FormLabel } from "../../../components/ui/form-label";
import { Input } from "../../../components/ui/input";
import { PasswordInput } from "../../../components/ui/password-input";
import { Button } from "../../../components/ui/button";
import { ErrorMessage } from "../../../components/ui/error-message";
import { Divider } from "../../../components/ui/divider";
import { AuthService } from "../../../services/auth.service";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFields = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const infoMessage = searchParams.get("message");

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "dummy_google_client_id",
        callback: async (response: any) => {
          setErrorMsg(null);
          setSuccessMsg(null);
          try {
            const res = await AuthService.googleLogin(response.credential);
            if (res.success) {
              setSuccessMsg("Success! Redirecting...");
              setTimeout(() => {
                router.push("/");
              }, 1000);
            }
          } catch (err: any) {
            setErrorMsg(err.response?.data?.message || "Google Sign In failed.");
          }
        },
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "outline", size: "large", width: 336 }
      );
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await AuthService.login(data.email, data.password);
      if (res.success) {
        setSuccessMsg("Success! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (err: any) {
      const serverMsg =
        err.response?.data?.message || "Invalid email or password. Please try again.";
      setErrorMsg(serverMsg);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your ColdMate account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {infoMessage && (
          <div className="mb-4 p-3 rounded-md bg-secondary/50 border border-border/40 text-xs text-muted-foreground">
            {infoMessage}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-md bg-green-500/10 border border-green-500/20 text-xs text-green-600 dark:text-green-400 font-medium">
            {successMsg}
          </div>
        )}

        <div id="google-signin-btn" className="w-full flex justify-center pb-2" />
        <Divider>or</Divider>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <FormLabel htmlFor="email">Email address</FormLabel>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              disabled={isSubmitting}
              {...register("email")}
            />
            <ErrorMessage message={errors.email?.message} />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <FormLabel htmlFor="password">Password</FormLabel>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={!!errors.password}
              disabled={isSubmitting}
              {...register("password")}
            />
            <ErrorMessage message={errors.password?.message} />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-ring transition-colors"
              disabled={isSubmitting}
              {...register("rememberMe")}
            />
            <label
              htmlFor="rememberMe"
              className="text-xs font-medium leading-none text-muted-foreground select-none cursor-pointer"
            >
              Remember me for 30 days
            </label>
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground hover:underline transition-colors"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <PageContainer>
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>Loading ColdMate account access...</CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </CardContent>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </PageContainer>
  );
}
