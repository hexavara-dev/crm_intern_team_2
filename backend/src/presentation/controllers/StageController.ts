import type { Request, Response } from 'express';
import { StageUseCase } from '../../usecases/stage/StageUseCase.js';
import { extractFilters } from '../../infrastructure/utils/QueryHelper.js';
import { respondWithError } from '../../infrastructure/utils/HttpErrorMapper.js';
import { validateStageCreate, validateStageUpdate } from '../validation/CrmRequestValidation.js';

export class StageController {
  constructor(private stageUseCase: StageUseCase) {}

  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const body = validateStageCreate(req.body);
      const data = await this.stageUseCase.createStage({ ...body, tenantId } as any);
      res.status(201).json(data);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const data = await this.stageUseCase.getStage(req.params.id as string, tenantId);
      res.json(data);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const filters = extractFilters(req.query);
      const data = await this.stageUseCase.getAllStages(tenantId, filters);
      res.json(data);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const body = validateStageUpdate(req.body);
      const data = await this.stageUseCase.updateStage(
        req.params.id as string,
        tenantId,
        body as any
      );
      res.json(data);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async reorder(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const data = await this.stageUseCase.reorderStages(tenantId, req.body?.stages);
      res.json(data);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      await this.stageUseCase.deleteStage(req.params.id as string, tenantId);
      res.status(204).send();
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }
}
