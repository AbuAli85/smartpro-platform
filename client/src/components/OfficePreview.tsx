import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Phone, Mail, Globe, Star, Clock } from "lucide-react";

interface OfficePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  office: {
    name: string;
    logoUrl?: string;
    coverImageUrl?: string;
    description?: string;
    governorate?: string;
    wilayat?: string;
    phone?: string;
    email?: string;
    website?: string;
    averageRating?: number;
    totalReviews?: number;
    workingHours?: Record<string, { enabled: boolean; start: string; end: string }>;
  };
}

export default function OfficePreview({ open, onOpenChange, office }: OfficePreviewProps) {
  const enabledDays = office.workingHours 
    ? Object.entries(office.workingHours)
        .filter(([_, hours]) => hours.enabled)
        .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Office Profile Preview</DialogTitle>
          <DialogDescription>
            This is how customers will see your office profile
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cover Image */}
          {office.coverImageUrl && (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
              <img 
                src={office.coverImageUrl} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Header with Logo */}
          <div className="flex items-start gap-4">
            {office.logoUrl ? (
              <img 
                src={office.logoUrl} 
                alt={office.name}
                className="w-20 h-20 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center border">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{office.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {office.averageRating && office.averageRating > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{office.averageRating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({office.totalReviews || 0} reviews)
                    </span>
                  </>
                ) : (
                  <Badge variant="secondary">New Office</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {office.description && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {office.description}
              </p>
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {office.governorate && office.wilayat && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{office.wilayat}, {office.governorate}</span>
                </div>
              )}
              {office.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{office.phone}</span>
                </div>
              )}
              {office.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{office.email}</span>
                </div>
              )}
              {office.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={office.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Working Hours */}
          {enabledDays.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Working Hours
              </h3>
              <div className="space-y-2">
                {Object.entries(office.workingHours || {}).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center text-sm">
                    <span className={`font-medium ${hours.enabled ? '' : 'text-muted-foreground'}`}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </span>
                    <span className={hours.enabled ? '' : 'text-muted-foreground'}>
                      {hours.enabled ? `${hours.start} - ${hours.end}` : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close Preview
            </Button>
            <Button>
              Book Service
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
