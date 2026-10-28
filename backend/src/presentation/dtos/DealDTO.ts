export interface CreateDealDTO {
  tenantId: string;
  leadId?: string;
  assignedUserId?: string;
  stageId?: string;
  statusId?: string;
  refCode?: string;
  dealType?: string;
  expectedAmount?: number;
  currency?: string;
  expectedClosingDate?: Date;
}

export interface UpdateDealDTO {
  amount?: number;
  leadId?: string | null;
  assignedUserId?: string | null;
  stageId?: string | null;
  statusId?: string | null;
  dealType?: string | null;
  expectedAmount?: number | null;
  currency?: string;
  expectedClosingDate?: Date | string | null;
  closingDate?: Date | string | null;
  lostReason?: string | null;
  lostNotes?: string | null;
}
