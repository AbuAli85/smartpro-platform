import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Mail, Phone, MapPin, Save } from "lucide-react";

interface OfficeProfileEditProps {
  officeId: number;
  initialData: {
    name: string;
    description: string | null;
    email: string;
    phone: string;
    address: string;
    region: string;
  };
  onSuccess?: () => void;
}

export function OfficeProfileEdit({ officeId, initialData, onSuccess }: OfficeProfileEditProps) {
  const [formData, setFormData] = useState({
    name: initialData.name,
    description: initialData.description || "",
    email: initialData.email,
    phone: initialData.phone,
    address: initialData.address,
    region: initialData.region,
  });

  const updateMutation = trpc.sanadOffice.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Office profile updated successfully!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      officeId,
      ...formData,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Edit Office Profile
        </CardTitle>
        <CardDescription>
          Update your office information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Office Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter office name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your office services..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="office@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+968 XXXX XXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address *
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              placeholder="Street address, building, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              required
              placeholder="Muscat, Salalah, etc."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#003366] hover:bg-[#004488]"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
