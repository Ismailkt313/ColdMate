"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, ArrowLeft } from "lucide-react";

import { PageContainer } from "../../../components/ui/page-container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";
import { FormLabel } from "../../../components/ui/form-label";
import { PasswordInput } from "../../../components/ui/password-input";
import { Button } from "../../../components/ui/button";
import { ErrorMessage } from "../../../components/ui/error-message";
import { AuthService } from "../../../services/auth.service";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFields = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFields) => {
    setErrorMsg(null);
    if (!token || !email) {
      setErrorMsg("Invalid or missing reset token/email parameters in URL.");
      return;
    }

    try {
      await AuthService.resetPassword(email, token, data.password);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to reset password.");
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <div className="h-10 w-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <CardTitle>Password reset complete</CardTitle>
          <CardDescription>
            Your password has been successfully updated. You can now log in to your account with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="w-full block">
            <Button className="w-full">Sign in</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>
          Create a secure password containing uppercase, lowercase, numbers, and symbols.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMsg && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <FormLabel htmlFor="password">New Password</FormLabel>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="new-password"
              autoFocus
              error={!!errors.password}
              disabled={isSubmitting}
              {...register("password")}
            />
            <ErrorMessage message={errors.password?.message} />
          </div>

          <div className="space-y-1.5">
            <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              disabled={isSubmitting}
              {...register("confirmPassword")}
            />
            <ErrorMessage message={errors.confirmPassword?.message} />
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Reset password
          </Button>
        </form>

        <div className="mt-6 text-center text-xs">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <PageContainer>
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Set new password</CardTitle>
              <CardDescription>Preparing password recovery details...</CardDescription>
            </CardHeader>
            <CardContent className="h-40 flex items-center justify-center">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </CardContent>
          </Card>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </PageContainer>
  );
}
