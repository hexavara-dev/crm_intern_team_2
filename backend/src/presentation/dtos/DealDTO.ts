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
}
