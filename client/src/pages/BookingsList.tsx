import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function BookingsList() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">My Bookings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>View and manage your service bookings</CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No bookings yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
