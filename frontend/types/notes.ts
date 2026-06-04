import { DealActivity, LeadActivity } from "@/types/activity";

export interface Note {
  id: string;
  title?: string;
  content: string;
  leadActivityId?: string;
  dealActivityId?: string;
  leadActivity?: LeadActivity;
  dealActivity?: DealActivity;
}
