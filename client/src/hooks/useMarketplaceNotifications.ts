import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useSocket } from "@/contexts/SocketContext";

export function useMarketplaceNotifications() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!user || !socket || !isConnected) return;

    console.log("[Marketplace] Setting up marketplace notifications");

    // Join marketplace room for this user
    socket.emit("join_marketplace", { userId: user.id });

    // Listen for new bids (customer)
    socket.on("marketplace:new_bid", (data: any) => {
      console.log("[Marketplace] New bid received:", data);
      toast.success(data.message, {
        description: `Price: ${data.price} OMR | Duration: ${data.estimatedDuration}`,
        action: {
          label: "View Bids",
          onClick: () => {
            window.location.href = "/my-requests";
          },
        },
        duration: 8000,
      });
    });

    // Listen for bid accepted (office)
    socket.on("marketplace:bid_accepted", (data: any) => {
      console.log("[Marketplace] Bid accepted:", data);
      toast.success(data.message, {
        description: `Customer: ${data.customerName} | Price: ${data.price} OMR`,
        action: {
          label: "View Booking",
          onClick: () => {
            window.location.href = "/bookings";
          },
        },
        duration: 8000,
      });
    });

    // Listen for new service requests (office)
    socket.on("marketplace:new_request", (data: any) => {
      console.log("[Marketplace] New service request:", data);
      toast.info(data.message, {
        description: `Budget: ${data.budget} | Deadline: ${new Date(data.deadline).toLocaleDateString()}`,
        action: {
          label: "View Request",
          onClick: () => {
            window.location.href = "/marketplace";
          },
        },
        duration: 8000,
      });
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit("leave_marketplace", { userId: user.id });
        socket.off("marketplace:new_bid");
        socket.off("marketplace:bid_accepted");
        socket.off("marketplace:new_request");
      }
    };
  }, [user, socket, isConnected]);
}
