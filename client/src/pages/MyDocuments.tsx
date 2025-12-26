import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function MyDocuments() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">My Documents</h1>
        <Card>
          <CardHeader>
            <CardTitle>Generated Documents</CardTitle>
            <CardDescription>Access your generated business documents</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents generated yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
