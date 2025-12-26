import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SmartBatchProcessing() {
  const [jobName, setJobName] = useState("");
  const [entityType, setEntityType] = useState<"office" | "template" | "both">("both");
  const [confidenceThreshold, setConfidenceThreshold] = useState([80]);
  const [useMemorySuggestions, setUseMemorySuggestions] = useState(true);

  const utils = trpc.useUtils();

  // Get untranslated count
  const { data: untranslatedCount } = trpc.smartBatchProcessing.getUntranslatedCount.useQuery({
    entityType,
  });

  // List jobs
  const { data: jobs, isLoading: jobsLoading } = trpc.smartBatchProcessing.listJobs.useQuery({
    limit: 20,
  });

  // Start batch job mutation
  const startJobMutation = trpc.smartBatchProcessing.startBatchJob.useMutation({
    onSuccess: (data) => {
      toast.success(`Batch job started! Job ID: ${data.jobId}`);
      setJobName("");
      utils.smartBatchProcessing.listJobs.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to start batch job: ${error.message}`);
    },
  });

  const handleStartJob = () => {
    if (!jobName.trim()) {
      toast.error("Please enter a job name");
      return;
    }

    startJobMutation.mutate({
      jobName,
      entityType,
      confidenceThreshold: confidenceThreshold[0],
      useMemorySuggestions,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "processing":
        return <Badge variant="default" className="bg-blue-500"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Smart Batch Processing</h1>
        <p className="text-muted-foreground mt-2">
          Automatically translate untranslated content with AI-powered confidence scoring
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create Job</TabsTrigger>
          <TabsTrigger value="jobs">Job History</TabsTrigger>
        </TabsList>

        {/* Create Job Tab */}
        <TabsContent value="create" className="space-y-6">
          {/* Untranslated Count Card */}
          <Card>
            <CardHeader>
              <CardTitle>Untranslated Content</CardTitle>
              <CardDescription>
                Current status of untranslated items in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {untranslatedCount ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{untranslatedCount.offices}</div>
                    <div className="text-sm text-muted-foreground">Untranslated Offices</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{untranslatedCount.templates}</div>
                    <div className="text-sm text-muted-foreground">Untranslated Templates</div>
                  </div>
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <div className="text-2xl font-bold text-primary">{untranslatedCount.total}</div>
                    <div className="text-sm text-muted-foreground">Total Items</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              )}
            </CardContent>
          </Card>

          {/* Job Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Create Batch Translation Job</CardTitle>
              <CardDescription>
                Configure and start an automated translation job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Name */}
              <div className="space-y-2">
                <Label htmlFor="jobName">Job Name</Label>
                <input
                  id="jobName"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="e.g., Translate All Offices - May 2024"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                />
              </div>

              {/* Entity Type */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <RadioGroup value={entityType} onValueChange={(value: any) => setEntityType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="office" id="office" />
                    <Label htmlFor="office" className="font-normal cursor-pointer">
                      Offices Only ({untranslatedCount?.offices || 0} items)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="template" id="template" />
                    <Label htmlFor="template" className="font-normal cursor-pointer">
                      Templates Only ({untranslatedCount?.templates || 0} items)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="font-normal cursor-pointer">
                      Both ({untranslatedCount?.total || 0} items)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Confidence Threshold</Label>
                  <span className="text-sm font-medium">{confidenceThreshold[0]}%</span>
                </div>
                <Slider
                  value={confidenceThreshold}
                  onValueChange={setConfidenceThreshold}
                  min={50}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Translations with confidence ≥ {confidenceThreshold[0]}% will be auto-approved.
                  Lower confidence items will be queued for review.
                </p>
              </div>

              {/* Memory Suggestions */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Use Translation Memory</Label>
                  <p className="text-sm text-muted-foreground">
                    Leverage previous translations for better accuracy
                  </p>
                </div>
                <Switch
                  checked={useMemorySuggestions}
                  onCheckedChange={setUseMemorySuggestions}
                />
              </div>

              {/* Start Button */}
              <div className="pt-4">
                <Button
                  onClick={handleStartJob}
                  disabled={startJobMutation.isPending || !untranslatedCount?.total}
                  className="w-full"
                  size="lg"
                >
                  {startJobMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Starting Job...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Batch Translation
                    </>
                  )}
                </Button>
                {!untranslatedCount?.total && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    No untranslated content available
                  </p>
                )}
              </div>

              {/* Info Alert */}
              <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-1">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                    <li>AI translates all untranslated content to Arabic</li>
                    <li>Confidence scores calculated based on multiple factors</li>
                    <li>High-confidence translations auto-approved and applied</li>
                    <li>Low-confidence translations queued for human review</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job History Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Batch Job History</CardTitle>
              <CardDescription>
                View status and results of all batch translation jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => {
                    const progress = job.totalItems > 0
                      ? (job.processedItems / job.totalItems) * 100
                      : 0;

                    return (
                      <div key={job.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{job.jobName}</h3>
                              {getStatusBadge(job.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Created by {job.createdByName} on{" "}
                              {new Date(job.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">Job #{job.id}</div>
                            <div className="text-muted-foreground capitalize">{job.entityType}</div>
                          </div>
                        </div>

                        {job.status === "processing" || job.status === "completed" ? (
                          <>
                            <Progress value={progress} className="h-2" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Progress</div>
                                <div className="font-medium">
                                  {job.processedItems} / {job.totalItems}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Auto-Approved</div>
                                <div className="font-medium text-green-600">
                                  {job.autoApprovedCount}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Queued for Review</div>
                                <div className="font-medium text-yellow-600">
                                  {job.queuedForReviewCount}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Failed</div>
                                <div className="font-medium text-red-600">
                                  {job.failedCount}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : null}

                        {job.status === "completed" && job.completedAt && (
                          <div className="text-sm text-muted-foreground">
                            Completed at {new Date(job.completedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">No batch jobs yet</div>
                  <Button variant="outline" onClick={() => document.querySelector<HTMLButtonElement>('[value="create"]')?.click()}>
                    Create Your First Job
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
