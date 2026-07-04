"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowLeft } from "lucide-react";

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
import { Button } from "../../../components/ui/button";
import { ErrorMessage } from "../../../components/ui/error-message";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFields = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFields) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTargetEmail(data.email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageContainer>
        <Card>
          <CardHeader className="items-center text-center">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary mb-2">
              <Mail className="h-5 w-5" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We have sent a temporary password reset link to <strong className="text-foreground">{targetEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground text-center">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
              Request another link
            </Button>
            <div className="text-center text-xs">
              <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we will email you a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
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

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Send reset link
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
    </PageContainer>
  );
}
