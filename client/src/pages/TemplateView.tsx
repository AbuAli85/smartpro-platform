import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function TemplateView() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Template view coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
