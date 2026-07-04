"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { PageContainer } from "../../../components/ui/page-container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function EmailVerificationSuccessPage() {
  return (
    <PageContainer>
      <Card>
        <CardHeader className="items-center text-center">
          <div className="h-12 w-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 mb-3 animate-pulse">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle>Email verified</CardTitle>
          <CardDescription>
            Your email has been verified successfully. Your ColdMate account is now fully active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="w-full block">
            <Button className="w-full">Proceed to sign in</Button>
          </Link>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
