"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

import { PageContainer } from "../components/ui/page-container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <PageContainer>
      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <div className="h-12 w-12 rounded-full bg-secondary border border-border/60 flex items-center justify-center text-muted-foreground mb-3">
            <FileQuestion className="h-6 w-6" />
          </div>
          <CardTitle>404 - Page not found</CardTitle>
          <CardDescription>
            The page you are looking for doesn&apos;t exist or has been moved to a new address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="w-full block">
            <Button className="w-full" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
            </Button>
          </Link>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
