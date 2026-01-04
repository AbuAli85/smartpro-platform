import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  Phone,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function RegulationDetail() {
  const [, params] = useRoute('/regulations/:id');
  const { language } = useLanguage();
  const regulationId = params?.id ? parseInt(params.id) : 0;

  const { data: regulation, isLoading } = trpc.contentManagement.getRegulationById.useQuery(
    { id: regulationId },
    { enabled: regulationId > 0 }
  );

  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedSteps(newChecked);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return AlertCircle;
      case 'medium':
        return Clock;
      case 'low':
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!regulation) {
    return (
      <div className="container mx-auto py-16 text-center">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Regulation Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The regulation you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/regulations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Regulations
          </Link>
        </Button>
      </div>
    );
  }

  const title = language === 'ar' && regulation.titleAr ? regulation.titleAr : regulation.title;
  const summary = language === 'ar' && regulation.summaryAr ? regulation.summaryAr : regulation.summary;
  const description =
    language === 'ar' && regulation.descriptionAr ? regulation.descriptionAr : regulation.description;
  const authority =
    language === 'ar' && regulation.issuingAuthorityAr
      ? regulation.issuingAuthorityAr
      : regulation.issuingAuthority;

  const complianceSteps = regulation.complianceSteps
    ? typeof regulation.complianceSteps === 'string'
      ? JSON.parse(regulation.complianceSteps)
      : regulation.complianceSteps
    : [];

  const requiredDocuments = regulation.requiredDocuments
    ? typeof regulation.requiredDocuments === 'string'
      ? JSON.parse(regulation.requiredDocuments)
      : regulation.requiredDocuments
    : [];

  const authorityContact = regulation.authorityContact
    ? typeof regulation.authorityContact === 'string'
      ? JSON.parse(regulation.authorityContact)
      : regulation.authorityContact
    : null;

  const PriorityIcon = getPriorityIcon(regulation.priority);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/regulations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Regulations
            </Link>
          </Button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant={getPriorityColor(regulation.priority) as any} className="gap-1">
                  <PriorityIcon className="h-3 w-3" />
                  {regulation.priority.toUpperCase()}
                </Badge>
                <Badge variant="outline">{regulation.category.replace('_', ' ')}</Badge>
                {regulation.featured === 1 && <Badge>Featured</Badge>}
              </div>
              <h1 className="text-4xl font-bold mb-3">{title}</h1>
              <p className="text-xl text-muted-foreground">{summary}</p>
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Issuing Authority</p>
                  <p className="font-semibold">{authority}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {regulation.estimatedCost && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Wallet className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    <p className="font-semibold">{regulation.estimatedCost}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {regulation.estimatedDuration && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Processing Time</p>
                    <p className="font-semibold">{regulation.estimatedDuration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {regulation.renewalRequired === 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Renewal</p>
                    <p className="font-semibold">{regulation.renewalPeriod || 'Required'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
              </CardContent>
            </Card>

            {/* Compliance Steps */}
            {complianceSteps && complianceSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Step-by-Step Compliance Checklist</CardTitle>
                  <CardDescription>
                    Follow these steps to ensure full compliance with this regulation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceSteps.map((step: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => toggleStep(index)}
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              checkedSteps.has(index)
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground'
                            }`}
                          >
                            {checkedSteps.has(index) && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">Step {index + 1}</span>
                            {step.duration && (
                              <Badge variant="outline" className="text-xs">
                                {step.duration}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{step.description || step.title || step}</p>
                          {step.details && <p className="text-sm text-muted-foreground">{step.details}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Progress: {checkedSteps.size} of {complianceSteps.length} steps completed
                    </p>
                    <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(checkedSteps.size / complianceSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Required Documents */}
            {requiredDocuments && requiredDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Documents</CardTitle>
                  <CardDescription>Documents you need to prepare for compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {requiredDocuments.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Authority Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Authority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {regulation.authorityWebsite && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={regulation.authorityWebsite} target="_blank" rel="noopener noreferrer">
                      <Globe className="mr-2 h-4 w-4" />
                      Visit Website
                      <ExternalLink className="ml-auto h-4 w-4" />
                    </a>
                  </Button>
                )}

                {authorityContact?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{authorityContact.phone}</span>
                  </div>
                )}

                {authorityContact?.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{authorityContact.email}</span>
                  </div>
                )}

                {authorityContact?.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{authorityContact.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Downloadable Guides */}
            {regulation.downloadableGuideUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Downloadable Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={regulation.downloadableGuideUrl} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download Guide (PDF)
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="default" className="w-full" asChild>
                  <Link href="/offices">Find Service Providers</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/request-service">Request Assistance</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
