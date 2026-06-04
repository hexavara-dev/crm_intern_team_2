export type Status = {
  id: string;
  tenantId: string;
  name: string;
  priority: number;
  color: string;
  type?: string;
  isDefaultStatus?: boolean;
  isClosingStatus?: boolean;
  isFailedStatus?: boolean;
  isSystemStatus?: boolean;
};

export type StatusType = "lead" | "deal" | "viewing";
