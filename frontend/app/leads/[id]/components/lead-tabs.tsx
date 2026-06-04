"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Activity, Attachment, CallLog, Note, Task } from "@/lib/data";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  FileText,
  Paperclip,
  Phone,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ActivityTimelineTab } from "./tabs/activity-timeline-tab";
import { AttachmentsTab } from "./tabs/attachments-tab";
import { CallLogsTab } from "./tabs/call-logs-tab";
import { NotesTab } from "./tabs/notes-tab";
import { TasksTab } from "./tabs/tasks-tab";
import { VisitTab } from "./tabs/visit-tab";

const VALID_TABS = [
  "calls",
  "activity",
  "tasks",
  "notes",
  "attachments",
  "visit",
] as const;
type LeadTabValue = (typeof VALID_TABS)[number];

type CallLogFormData = {
  duration: number;
  notes: string;
};

type TaskFormData = {
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "normal" | "high" | "urgent";
  assignedUserId?: string;
};

type NoteFormData = {
  content: string;
};

type AttachmentFormData = {
  name: string;
  file: FileList;
};

interface LeadTabsProps {
  leadId: string;
  callLogs: CallLog[];
  activities: Activity[];
  tasks: Task[];
  notes: Note[];
  attachments: Attachment[];
  onAddCallLog: (data: CallLogFormData) => void;
  onAddTask: (data: TaskFormData) => void;
  onUpdateTask: (id: string, data: Partial<TaskFormData>) => void;
  onDeleteTask: (id: string) => void;
  onAddNote: (data: NoteFormData) => void;
  onAddAttachment: (data: AttachmentFormData) => void;
}

export function LeadTabs({
  leadId,
  callLogs,
  activities,
  tasks,
  notes,
  attachments,
  onAddCallLog,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddNote,
  onAddAttachment,
}: LeadTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo<LeadTabValue>(() => {
    const tabParam = searchParams.get("tab");
    return VALID_TABS.includes(tabParam as LeadTabValue)
      ? (tabParam as LeadTabValue)
      : "calls";
  }, [searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "calls") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-background">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col"
      >
        <div className="border-b">
          <div className="p-4 md:p-6">
            <TabsList
              variant="line"
              className="h-12 gap-4 md:gap-6 w-max md:w-auto overflow-hidden"
            >
              <TabsTrigger value="calls" className="px-0">
                <Phone className="size-4" />
                <span className="hidden sm:inline">Calls</span>
                {callLogs.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 px-1 min-w-4.5 rounded-full text-[10px] flex items-center justify-center"
                  >
                    {callLogs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity" className="px-0">
                <Clock className="size-4" />
                <span className="hidden sm:inline">Timeline</span>
                {activities.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 px-1 min-w-4.5 rounded-full text-[10px] flex items-center justify-center"
                  >
                    {activities.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="tasks" className="px-0">
                <CheckCircle className="size-4" />
                <span className="hidden sm:inline">Tasks</span>
                {tasks.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 px-1 min-w-4.5 rounded-full text-[10px] flex items-center justify-center"
                  >
                    {tasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="notes" className="px-0">
                <FileText className="size-4" />
                <span className="hidden sm:inline">Notes</span>
                {notes.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 px-1 min-w-4.5 rounded-full text-[10px] flex items-center justify-center"
                  >
                    {notes.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="attachments" className="px-0">
                <Paperclip className="size-4" />
                <span className="hidden sm:inline">Files</span>
                {attachments.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 px-1 min-w-4.5 rounded-full text-[10px] flex items-center justify-center"
                  >
                    {attachments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="visit" className="px-0">
                <CalendarCheck className="size-4" />
                <span className="hidden sm:inline">Visit</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <TabsContent value="calls" className="mt-0">
              <CallLogsTab callLogs={callLogs} onAddCallLog={onAddCallLog} />
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <ActivityTimelineTab activities={activities} />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <TasksTab
                tasks={tasks}
                onAddTask={onAddTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
              />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <NotesTab notes={notes} onAddNote={onAddNote} />
            </TabsContent>

            <TabsContent value="attachments" className="mt-0">
              <AttachmentsTab
                attachments={attachments}
                onAddAttachment={onAddAttachment}
              />
            </TabsContent>

            <TabsContent value="visit" className="mt-0">
              <VisitTab leadId={leadId} />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
