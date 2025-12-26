import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Clock, MessageSquare, Save } from "lucide-react";

export default function FollowUpSettings() {
  
  // Settings state
  const [enabled24h, setEnabled24h] = useState(true);
  const [enabled48h, setEnabled48h] = useState(true);
  const [template24h, setTemplate24h] = useState(
    "Hello! We noticed you haven't responded to our message. Is there anything we can help you with?"
  );
  const [template48h, setTemplate48h] = useState(
    "Hi again! We're still here to help. Please let us know if you need any assistance with your inquiry."
  );

  const handleSave = () => {
    // In a real implementation, this would save to database
    toast.success("Settings saved successfully", {
      description: "Your follow-up settings have been updated.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Automated Follow-up Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure automatic follow-up messages for inactive conversations
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* 24-hour Follow-up */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <CardTitle>24-Hour Follow-up</CardTitle>
                  <CardDescription>
                    Send a follow-up message if no response after 24 hours
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={enabled24h}
                onCheckedChange={setEnabled24h}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="template24h">Message Template</Label>
              <Textarea
                id="template24h"
                value={template24h}
                onChange={(e) => setTemplate24h(e.target.value)}
                disabled={!enabled24h}
                rows={3}
                placeholder="Enter your 24-hour follow-up message..."
              />
              <p className="text-sm text-muted-foreground">
                This message will be sent automatically to customers who haven't responded within 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 48-hour Follow-up */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-red-500" />
                <div>
                  <CardTitle>48-Hour Follow-up</CardTitle>
                  <CardDescription>
                    Send a second follow-up if still no response after 48 hours
                  </CardDescription>
                </div>
              </div>
              <Switch
                checked={enabled48h}
                onCheckedChange={setEnabled48h}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="template48h">Message Template</Label>
              <Textarea
                id="template48h"
                value={template48h}
                onChange={(e) => setTemplate48h(e.target.value)}
                disabled={!enabled48h}
                rows={3}
                placeholder="Enter your 48-hour follow-up message..."
              />
              <p className="text-sm text-muted-foreground">
                This message will be sent if the customer still hasn't responded after 48 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-blue-900 dark:text-blue-100">Best Practices</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <ul className="list-disc list-inside space-y-1">
              <li>Keep messages friendly and helpful, not pushy</li>
              <li>Offer specific assistance related to their inquiry</li>
              <li>Include your contact information for direct communication</li>
              <li>Respect customer preferences - they may respond when ready</li>
              <li>Monitor response rates and adjust timing if needed</li>
            </ul>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
