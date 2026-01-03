import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  status: "completed" | "current" | "pending" | "cancelled";
  icon?: React.ReactNode;
}

interface RequestTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function RequestTimeline({ events, className }: RequestTimelineProps) {
  const getStatusIcon = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "current":
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-600 bg-green-50";
      case "current":
        return "border-blue-600 bg-blue-50";
      case "cancelled":
        return "border-red-600 bg-red-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const isCompleted = event.status === "completed";
        const isCurrent = event.status === "current";

        return (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[18px] top-10 w-0.5 h-full -ml-px",
                  isCompleted ? "bg-green-600" : "bg-gray-300"
                )}
              />
            )}

            {/* Event card */}
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center",
                  getStatusColor(event.status)
                )}
              >
                {event.icon || getStatusIcon(event.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4
                      className={cn(
                        "font-semibold",
                        isCurrent && "text-blue-600",
                        isCompleted && "text-gray-900",
                        event.status === "pending" && "text-gray-500"
                      )}
                    >
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                  <time className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {event.timestamp.toLocaleDateString()} {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface StatusTimelineProps {
  currentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}

export function StatusTimeline({
  currentStatus,
  createdAt,
  updatedAt,
  acceptedAt,
  completedAt,
  cancelledAt,
}: StatusTimelineProps) {
  const events: TimelineEvent[] = [
    {
      id: "created",
      title: "Request Submitted",
      description: "Your service request has been created and is being analyzed",
      timestamp: createdAt,
      status: "completed",
    },
  ];

  if (currentStatus === "bidding" || currentStatus === "awarded" || currentStatus === "in_progress" || currentStatus === "completed") {
    events.push({
      id: "bidding",
      title: "Receiving Bids",
      description: "Offices are reviewing your request and submitting bids",
      timestamp: updatedAt,
      status: currentStatus === "bidding" ? "current" : "completed",
    });
  }

  if (acceptedAt && (currentStatus === "awarded" || currentStatus === "in_progress" || currentStatus === "completed")) {
    events.push({
      id: "awarded",
      title: "Bid Accepted",
      description: "You have accepted a bid and the service is being prepared",
      timestamp: acceptedAt,
      status: currentStatus === "awarded" ? "current" : "completed",
    });
  }

  if (currentStatus === "in_progress" || currentStatus === "completed") {
    events.push({
      id: "in_progress",
      title: "Service In Progress",
      description: "The office is working on your service request",
      timestamp: updatedAt,
      status: currentStatus === "in_progress" ? "current" : "completed",
    });
  }

  if (completedAt && currentStatus === "completed") {
    events.push({
      id: "completed",
      title: "Service Completed",
      description: "Your service has been completed successfully",
      timestamp: completedAt,
      status: "completed",
    });
  }

  if (cancelledAt && currentStatus === "cancelled") {
    events.push({
      id: "cancelled",
      title: "Request Cancelled",
      description: "This service request has been cancelled",
      timestamp: cancelledAt,
      status: "cancelled",
    });
  }

  // Add pending steps
  if (currentStatus === "open") {
    events.push({
      id: "waiting_bids",
      title: "Waiting for Bids",
      description: "Offices will review and submit bids for your request",
      timestamp: new Date(),
      status: "current",
    });
  }

  if (!completedAt && !cancelledAt && currentStatus !== "completed" && currentStatus !== "cancelled") {
    events.push({
      id: "completion",
      title: "Service Completion",
      description: "Service will be marked as completed",
      timestamp: new Date(),
      status: "pending",
    });
  }

  return <RequestTimeline events={events} />;
}
