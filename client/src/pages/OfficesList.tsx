import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Building2, MapPin, Star, Search, Plus, Filter } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdvancedFilters, type FilterState } from "@/components/AdvancedFilters";

export default function OfficesList() {
  const [search, setSearch] = useState("");
  const [governorate, setGovernorate] = useState<string>();
  const [page, setPage] = useState(1);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({});
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = trpc.sanadOffice.list.useQuery({
    page,
    limit: 12,
    search: search || undefined,
    governorate,
    status: "active",
  });

  const governorates = [
    "Muscat",
    "Dhofar",
    "Musandam",
    "Al Buraimi",
    "Ad Dakhiliyah",
    "Al Batinah North",
    "Al Batinah South",
    "Ash Sharqiyah North",
    "Ash Sharqiyah South",
    "Al Dhahirah",
    "Al Wusta",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      

      <div className="container py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Sanad Offices" }]} className="mb-6" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Sanad Offices</h1>
            <p className="text-muted-foreground mt-2">
              Browse certified Sanad offices across Oman
            </p>
          </div>
          {isAuthenticated && (
            <Button asChild size="lg" className="bg-gradient-accent hover:opacity-90">
              <Link href="/create-office">
                <a className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Register Your Office
                </a>
              </Link>
            </Button>
          )}
        </div>

        {/* Basic Filters */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search offices by name or location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select value={governorate} onValueChange={(value) => {
            setGovernorate(value === "all" ? undefined : value);
            setPage(1);
          }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Governorates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Governorates</SelectItem>
              {governorates.map((gov) => (
                <SelectItem key={gov} value={gov}>
                  {gov}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters 
          filters={advancedFilters} 
          onFiltersChange={setAdvancedFilters} 
          className="mb-8"
        />

        {/* Offices Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-full h-40 bg-muted rounded-md mb-4" />
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : data && data.offices.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.offices.map((office) => (
                <Card key={office.id} className="hover:shadow-elegant-lg transition-all duration-300 border-2 hover:border-primary/50">
                  <CardHeader>
                    {office.coverImageUrl ? (
                      <img
                        src={office.coverImageUrl}
                        alt={office.officeName}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-elegant rounded-md mb-4 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <CardTitle className="line-clamp-1">{office.officeName}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {office.description || "Professional business services"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{office.governorate}, {office.wilayat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-accent text-accent mr-1" />
                        <span className="font-medium">{office.averageRating || "0.0"}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({office.totalReviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {office.verificationStatus === "verified" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          ✓ Verified
                        </Badge>
                      )}
                      {office.autoAcceptBookings && (
                        <Badge variant="secondary">Instant Booking</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="default" className="w-full">
                      <Link href={`/offices/${office.slug}`}>
                        <a>View Office</a>
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data.total > data.limit && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Page {page} of {Math.ceil(data.total / data.limit)}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= Math.ceil(data.total / data.limit)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No offices found</h3>
            <p className="text-muted-foreground mb-6">
              {search || governorate
                ? "Try adjusting your search criteria"
                : "Be the first to register your Sanad office"}
            </p>
            {isAuthenticated && (
              <Button asChild>
                <Link href="/create-office">
                  <a>Register Your Office</a>
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
