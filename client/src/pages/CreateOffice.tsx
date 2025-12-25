import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Building2 } from "lucide-react";

export default function CreateOffice() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <div className="container py-8 max-w-4xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/offices">
            <a className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Offices
            </a>
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-elegant flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl">Register Your Sanad Office</CardTitle>
                <CardDescription className="text-base mt-1">
                  Join SmartPro and reach thousands of SMEs across Oman
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Office registration form coming soon
              </p>
              <p className="text-sm text-muted-foreground">
                This feature will allow you to register your Sanad office with complete details,
                services, and verification documents.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
