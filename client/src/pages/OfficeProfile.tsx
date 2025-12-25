import { useRoute, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Building2, MapPin, Phone, Mail, Globe, Star, Calendar, ArrowLeft } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function OfficeProfile() {
  const [, params] = useRoute("/offices/:slug");
  const slug = params?.slug || "";
  const { isAuthenticated } = useAuth();

  const { data: office, isLoading } = trpc.sanadOffice.getBySlug.useQuery({ slug });
  const { data: reviews } = trpc.review.getOfficeReviews.useQuery(
    { officeId: office?.id || 0 },
    { enabled: !!office?.id }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Office Not Found</h2>
          <Button asChild>
            <Link href="/offices"><a>Browse Offices</a></Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <div className="container py-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/offices">
            <a className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Offices
            </a>
          </Link>
        </Button>

        {/* Hero Section */}
        <div className="mb-8">
          {office.coverImageUrl ? (
            <img
              src={office.coverImageUrl}
              alt={office.officeName}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-elegant rounded-lg mb-6 flex items-center justify-center">
              <Building2 className="w-20 h-20 text-white" />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{office.officeName}</h1>
                {office.verificationStatus === "verified" && (
                  <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg mb-4">{office.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{office.governorate}, {office.wilayat}</span>
                </div>
                {office.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{office.phone}</span>
                  </div>
                )}
                {office.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{office.email}</span>
                  </div>
                )}
                {office.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={office.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <Button asChild size="lg" className="bg-gradient-accent">
                <a href={`/book/${office.id}`} className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Book Service
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="space-y-6">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About This Office</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-muted-foreground">{office.wilayat}, {office.governorate}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  {office.phone && <p className="text-muted-foreground">Phone: {office.phone}</p>}
                  {office.email && <p className="text-muted-foreground">Email: {office.email}</p>}
                  {office.website && (
                    <p className="text-muted-foreground">
                      Website: <a href={office.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{office.website}</a>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
                <CardDescription>Professional business services offered by this office</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Services information will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold">
                          {review.userName?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-semibold">{review.userName || "Anonymous"}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "fill-accent text-accent" : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                  {review.reviewText && (
                    <CardContent>
                      <p className="text-muted-foreground">{review.reviewText}</p>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
