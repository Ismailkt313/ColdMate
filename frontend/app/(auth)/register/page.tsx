"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { AuthService } from "../../../services/auth.service";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFields) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await AuthService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (res.success) {
        setSuccessMsg("Account created! Redirecting to verification...");
        setTimeout(() => {
          router.push("/email-verification-success");
        }, 1200);
      }
    } catch (err: any) {
      const serverMsg =
        err.response?.data?.message || "Registration failed. Please check details.";
      setErrorMsg(serverMsg);
    }
  };

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to set up your new ColdMate account
          </CardDescription>
        </CardHeader>
        <CardContent>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <FormLabel htmlFor="name">Full name</FormLabel>
              <Input
                id="name"
                placeholder="John Doe"
                autoComplete="name"
                autoFocus
                error={!!errors.name}
                disabled={isSubmitting}
                {...register("name")}
              />
              <ErrorMessage message={errors.name?.message} />
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                error={!!errors.email}
                disabled={isSubmitting}
                {...register("email")}
              />
              <ErrorMessage message={errors.email?.message} />
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="password">Password</FormLabel>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="new-password"
                error={!!errors.password}
                disabled={isSubmitting}
                {...register("password")}
              />
              <ErrorMessage message={errors.password?.message} />
            </div>

            <div className="space-y-1.5">
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
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
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
