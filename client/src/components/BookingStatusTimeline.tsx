import { CheckCircle2, Clock, XCircle, AlertCircle, Calendar, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  status: string;
  timestamp: Date;
  description?: string;
  actor?: string;
}

interface BookingStatusTimelineProps {
  booking: {
    id: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    scheduledDate?: Date;
    scheduledTime?: string;
    completedAt?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
  };
  events?: TimelineEvent[];
}

export function BookingStatusTimeline({ booking, events }: BookingStatusTimelineProps) {
  const { t } = useLanguage();

  // Build timeline from booking data
  const timeline: TimelineEvent[] = events || [
    {
      status: "created",
      timestamp: booking.createdAt,
      description: t("booking.timeline.bookingCreated"),
    },
    ...(booking.status === "confirmed" || booking.status === "completed"
      ? [
          {
            status: "confirmed",
            timestamp: booking.updatedAt,
            description: t("booking.timeline.bookingConfirmed"),
          },
        ]
      : []),
    ...(booking.scheduledDate
      ? [
          {
            status: "scheduled",
            timestamp: booking.scheduledDate,
            description: `${t("booking.timeline.appointmentScheduled")} ${booking.scheduledTime || ""}`,
          },
        ]
      : []),
    ...(booking.status === "completed" && booking.completedAt
      ? [
          {
            status: "completed",
            timestamp: booking.completedAt,
            description: t("booking.timeline.serviceCompleted"),
          },
        ]
      : []),
    ...(booking.status === "cancelled" && booking.cancelledAt
      ? [
          {
            status: "cancelled",
            timestamp: booking.cancelledAt,
            description: booking.cancelReason || t("booking.timeline.bookingCancelled"),
          },
        ]
      : []),
  ];

  const getStatusIcon = (status: string, isActive: boolean) => {
    const iconClass = cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground");

    switch (status) {
      case "created":
        return <Calendar className={iconClass} />;
      case "confirmed":
        return <CheckCircle2 className={iconClass} />;
      case "scheduled":
        return <Clock className={iconClass} />;
      case "completed":
        return <FileCheck className={iconClass} />;
      case "cancelled":
        return <XCircle className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "created":
        return "bg-blue-500";
      case "confirmed":
        return "bg-green-500";
      case "scheduled":
        return "bg-purple-500";
      case "completed":
        return "bg-emerald-600";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCurrentStatusIndex = () => {
    const statusOrder = ["created", "confirmed", "scheduled", "completed"];
    if (booking.status === "cancelled") return timeline.findIndex((e) => e.status === "cancelled");
    return timeline.findIndex((e) => statusOrder.indexOf(e.status) >= statusOrder.indexOf(booking.status));
  };

  const currentIndex = getCurrentStatusIndex();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t("booking.timeline.title")}
        </CardTitle>
        <CardDescription>{t("booking.timeline.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {timeline.map((event, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={index} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                    isActive ? getStatusColor(event.status) : "bg-muted border-border"
                  )}
                >
                  {getStatusIcon(event.status, isActive)}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn("font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                          {t(`booking.status.${event.status}`) || event.status}
                        </p>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">
                            {t("booking.timeline.current")}
                          </Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      )}
                      {event.actor && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("booking.timeline.by")} {event.actor}
                        </p>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(event.timestamp, "MMM d, HH:mm")}
                    </time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Steps */}
        {booking.status !== "completed" && booking.status !== "cancelled" && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">{t("booking.timeline.nextSteps")}</h4>
            <p className="text-sm text-muted-foreground">
              {booking.status === "pending" && t("booking.timeline.nextSteps.pending")}
              {booking.status === "confirmed" && t("booking.timeline.nextSteps.confirmed")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
