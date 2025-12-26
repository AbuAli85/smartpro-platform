import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Award, BookOpen, Target, Users, FileText } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function TranslationQualityDashboard() {
  const { t } = useLanguage();

  // Fetch all dashboard data
  const { data: qualityMetrics, isLoading: metricsLoading } = trpc.translationQuality.getQualityMetrics.useQuery();
  const { data: translatorPerformance, isLoading: performanceLoading } = trpc.translationQuality.getTranslatorPerformance.useQuery({});
  const { data: mostUsedPhrases, isLoading: phrasesLoading } = trpc.translationQuality.getMostUsedPhrases.useQuery({ limit: 10 });
  const { data: accuracyTrends, isLoading: trendsLoading } = trpc.translationQuality.getAccuracyTrends.useQuery({ groupBy: "day" });
  const { data: sourceDistribution, isLoading: sourceLoading } = trpc.translationQuality.getSourceDistribution.useQuery();

  if (metricsLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const totalCompletion = qualityMetrics
    ? Math.round(
        ((qualityMetrics.offices.fullyTranslated + qualityMetrics.templates.fullyTranslated) /
          (qualityMetrics.offices.total + qualityMetrics.templates.total)) *
          100
      )
    : 0;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Target className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Translation Quality Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Monitor translation accuracy, performance metrics, and quality trends
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCompletion}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(qualityMetrics?.offices.fullyTranslated || 0) + (qualityMetrics?.templates.fullyTranslated || 0)} of{" "}
              {(qualityMetrics?.offices.total || 0) + (qualityMetrics?.templates.total || 0)} items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offices Translated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{qualityMetrics?.offices.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {qualityMetrics?.offices.fullyTranslated} of {qualityMetrics?.offices.total} offices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Templates Translated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{qualityMetrics?.templates.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {qualityMetrics?.templates.fullyTranslated} of {qualityMetrics?.templates.total} templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Translators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{translatorPerformance?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">
            <Award className="h-4 w-4 mr-2" />
            Translator Performance
          </TabsTrigger>
          <TabsTrigger value="accuracy">
            <TrendingUp className="h-4 w-4 mr-2" />
            Accuracy Trends
          </TabsTrigger>
          <TabsTrigger value="memory">
            <BookOpen className="h-4 w-4 mr-2" />
            Memory Phrases
          </TabsTrigger>
          <TabsTrigger value="sources">
            <FileText className="h-4 w-4 mr-2" />
            Translation Sources
          </TabsTrigger>
        </TabsList>

        {/* Translator Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Translator Leaderboard</CardTitle>
              <CardDescription>Top translators ranked by performance score</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : translatorPerformance && translatorPerformance.length > 0 ? (
                <div className="space-y-4">
                  {translatorPerformance.map((translator, index) => (
                    <div key={translator.translatorId} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{translator.translatorName}</h3>
                          <Badge variant="secondary">Score: {translator.performanceScore}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">{translator.totalTranslations}</span> total
                          </div>
                          <div>
                            <span className="font-medium">{translator.manualTranslations}</span> manual
                          </div>
                          <div>
                            <span className="font-medium">{translator.autoTranslations}</span> AI
                          </div>
                          <div>
                            <span className="font-medium">{translator.uniqueEntities}</span> entities
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No translator data available</p>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart */}
          {translatorPerformance && translatorPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
                <CardDescription>Translation breakdown by translator</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={translatorPerformance.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="translatorName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="manualTranslations" fill="#0088FE" name="Manual" />
                    <Bar dataKey="autoTranslations" fill="#00C49F" name="AI-Assisted" />
                    <Bar dataKey="bulkImports" fill="#FFBB28" name="Bulk Import" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Accuracy Trends Tab */}
        <TabsContent value="accuracy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Translation Accuracy Over Time</CardTitle>
              <CardDescription>Accuracy score based on revision frequency (fewer revisions = higher accuracy)</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : accuracyTrends && accuracyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={accuracyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="accuracyScore" stroke="#0088FE" name="Accuracy Score" strokeWidth={2} />
                    <Line type="monotone" dataKey="totalChanges" stroke="#FF8042" name="Total Changes" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">No accuracy data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memory Phrases Tab */}
        <TabsContent value="memory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Most-Used Translation Memory Phrases</CardTitle>
              <CardDescription>Top phrases reused across translations</CardDescription>
            </CardHeader>
            <CardContent>
              {phrasesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : mostUsedPhrases && mostUsedPhrases.length > 0 ? (
                <div className="space-y-3">
                  {mostUsedPhrases.map((phrase, index) => (
                    <div key={phrase.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary">{phrase.context}</Badge>
                        <Badge>{phrase.usageCount} uses</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">EN:</span> {phrase.sourceText}
                        </p>
                        <p className="text-sm" dir="rtl">
                          <span className="font-medium">AR:</span> {phrase.translatedText}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No memory phrases available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Translation Sources Tab */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Translation Source Distribution</CardTitle>
              <CardDescription>How translations are being created (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              {sourceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : sourceDistribution && sourceDistribution.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourceDistribution}
                        dataKey="count"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {sourceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {sourceDistribution.map((source, index) => (
                      <div key={source.source} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <p className="font-medium capitalize">{source.source.replace("_", " ")}</p>
                            <p className="text-sm text-muted-foreground">
                              {source.uniqueTranslators} translator{source.uniqueTranslators !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{source.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No source data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
