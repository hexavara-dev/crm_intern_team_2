export interface CreateStageDTO {
  tenantId: string;
  name: string;
  position?: number;
  color?: string;
  entityType?: string;
  isTerminalStage?: boolean;
  isDefaultStage?: boolean;
}

export interface UpdateStageDTO {
  name?: string;
  position?: number;
  color?: string;
  entityType?: string;
  isTerminalStage?: boolean;
  isDefaultStage?: boolean;
}
