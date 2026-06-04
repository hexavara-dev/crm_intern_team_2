export interface CreateLeadDTO {
  tenantId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  statusId?: string;
  sourceId?: string;
  sourceUserId?: string;
  assignedUserId?: string;
  notes?: string;
  type?: string;
  gender?: string;
  salutation?: string;
  organizationName?: string;
  organizationLocation?: string;
  location?: string;
  locationId?: string;
}

export interface UpdateLeadDTO {
  assignedUserId?: string;
  stageId?: string;
  statusId?: string;
  locationId?: string;
  statusName?: string;
  type?: string;
  converted?: boolean;
  convertedDate?: Date;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  salutation?: string;
  location?: string;
  sourceId?: string;
  organizationName?: string;
  organizationLocation?: string;
}
