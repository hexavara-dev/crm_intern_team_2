"use client";

import { ActivityTimelineTab } from "@/app/leads/[id]/components/tabs/activity-timeline-tab";
import { AttachmentsTab } from "@/app/leads/[id]/components/tabs/attachments-tab";
import { CallLogsTab } from "@/app/leads/[id]/components/tabs/call-logs-tab";
import { NotesTab } from "@/app/leads/[id]/components/tabs/notes-tab";
import { TasksTab } from "@/app/leads/[id]/components/tabs/tasks-tab";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Activity, Attachment, CallLog, Note, Task } from "@/lib/data";
import {
  CallLogFormData,
  NoteFormData,
  TaskFormData,
} from "@/schemas/deal.schema";
import { CheckCircle, Clock, FileText, Paperclip, Phone } from "lucide-react";

type AttachmentFormData = {
  name: string;
  file: FileList;
};

interface DealTabsProps {
  callLogs: CallLog[];
  activities: Activity[];
  tasks: Task[];
  notes: Note[];
  attachments: Attachment[];
  onAddCallLog: (data: CallLogFormData) => Promise<void>;
  onAddTask: (data: TaskFormData) => Promise<void>;
  onUpdateTask: (id: string, data: Partial<TaskFormData>) => Promise<void>;
  onDeleteTask: (id: string) => void;
  onAddNote: (data: NoteFormData) => Promise<void>;
  onAddAttachment: (data: AttachmentFormData) => void;
}

export function DealTabs({
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
}: DealTabsProps) {
  return (
    <div className="flex-1 min-w-0 flex flex-col bg-background">
      <Tabs defaultValue="calls" className="flex-1 flex flex-col">
        <div className="border-b overflow-x-auto">
          <div className="p-4 md:p-6">
            <TabsList
              variant="line"
              className="h-12 gap-4 md:gap-6 w-max md:w-auto"
            >
              <TabsTrigger value="calls" className="px-0">
                <Phone className="size-4" />
                <span className="hidden sm:inline">Calls</span>
                {callLogs.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 px-1 min-w-[1.125rem] rounded-full text-[10px] flex items-center justify-center"
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
                    className="ml-1.5 h-5 px-1 min-w-[1.125rem] rounded-full text-[10px] flex items-center justify-center"
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
                    className="ml-1.5 h-5 px-1 min-w-[1.125rem] rounded-full text-[10px] flex items-center justify-center"
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
                    className="ml-1.5 h-5 px-1 min-w-[1.125rem] rounded-full text-[10px] flex items-center justify-center"
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
                    className="ml-1.5 h-5 px-1 min-w-[1.125rem] rounded-full text-[10px] flex items-center justify-center"
                  >
                    {attachments.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <TabsContent value="calls" className="mt-0">
              <CallLogsTab
                callLogs={callLogs}
                onAddCallLog={onAddCallLog}
                entityLabel="deal"
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <ActivityTimelineTab activities={activities} entityLabel="deal" />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <TasksTab
                tasks={tasks}
                onAddTask={onAddTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                entityLabel="deal"
              />
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <NotesTab
                notes={notes}
                onAddNote={onAddNote}
                entityLabel="deal"
              />
            </TabsContent>

            <TabsContent value="attachments" className="mt-0">
              <AttachmentsTab
                attachments={attachments}
                onAddAttachment={onAddAttachment}
                entityLabel="deal"
              />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
