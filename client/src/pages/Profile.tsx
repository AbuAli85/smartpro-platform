import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";

export default function Profile() {
  const { user, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const utils = trpc.useUtils();
  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update profile", { description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    updateProfileMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container py-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">Please log in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#003366]" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name *
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{user.name || "Not provided"}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email address"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{user.email || "Not provided"}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+968 XXXX XXXX"
                        />
                      ) : (
                        <p className="text-gray-900 py-2">{user.phone || "Not provided"}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    {isEditing ? (
                      <>
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="bg-[#003366] hover:bg-[#002244]"
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateProfileMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="bg-[#003366] hover:bg-[#002244]"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#003366]" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  View your account details and login information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Member Since</span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Account Role</span>
                  </div>
                  <span className="text-gray-900 font-medium capitalize">
                    {user.role}
                  </span>
                </div>

                {user.loginMethod && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Login Method</span>
                    </div>
                    <span className="text-gray-900 font-medium capitalize">
                      {user.loginMethod}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
