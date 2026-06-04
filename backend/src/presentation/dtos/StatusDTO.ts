export interface CreateStatusDTO {
  tenantId: string;
  name: string;
  priority?: number;
  color?: string;
  type?: string;
  isDefaultStatus?: boolean;
  isClosingStatus?: boolean;
}

export interface UpdateStatusDTO {
  name?: string;
  priority?: number;
  color?: string;
  type?: string;
  isDefaultStatus?: boolean;
  isClosingStatus?: boolean;
}
