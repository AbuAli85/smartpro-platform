import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TemplatesList() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Document Templates</h1>
        <Card>
          <CardHeader>
            <CardTitle>Template Library</CardTitle>
            <CardDescription>Access 3,000+ business document templates</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Template library coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
