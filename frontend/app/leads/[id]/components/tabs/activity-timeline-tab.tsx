import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Activity } from "@/lib/data";
import { formatDateTime } from "@/lib/helper";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  PhoneCall,
  Timer,
} from "lucide-react";

const activityTypeIcons = {
  call: PhoneCall,
  email: Mail,
  comment: MessageSquare,
  meeting: Calendar,
  note: FileText,
};

const activityTypeColors = {
  call: "bg-blue-100 text-blue-600",
  email: "bg-purple-100 text-purple-600",
  comment: "bg-amber-100 text-amber-600",
  meeting: "bg-green-100 text-green-600",
  note: "bg-gray-100 text-gray-600",
};

interface ActivityTimelineTabProps {
  activities: Activity[];
  entityLabel?: string;
}

export function ActivityTimelineTab({
  activities,
  entityLabel = "lead",
}: ActivityTimelineTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Activity Timeline
        </h2>
        <p className="text-sm text-muted-foreground">
          Comprehensive log of all {entityLabel} interactions and updates.
        </p>
      </div>

      {activities.length === 0 ? (
        <Empty className="py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No activities recorded</EmptyTitle>
            <EmptyDescription>
              All interactions will be automatically logged here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-2.75 before:w-px before:bg-border">
          {activities
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((activity) => {
              const Icon = activityTypeIcons[activity.type] || Timer;
              return (
                <div key={activity.id} className="relative flex gap-4">
                  <div
                    className={cn(
                      " h-6 w-6 rounded-full border bg-background flex items-center justify-center shrink-0 z-10",
                      activityTypeColors[activity.type],
                    )}
                  >
                    <Icon className="size-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">
                        {activity.type}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDateTime(activity.createdAt)}
                      </span>
                    </div>
                    <Card className="shadow-none border bg-muted/20">
                      <CardContent className="p-3">
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
