import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function MyOffices() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">My Offices</h1>
        <Card>
          <CardHeader>
            <CardTitle>Office Management</CardTitle>
            <CardDescription>Manage your registered Sanad offices</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No offices registered yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
