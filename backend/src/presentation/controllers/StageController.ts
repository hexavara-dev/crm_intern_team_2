import type { Request, Response } from 'express';
import { StageUseCase } from '../../usecases/stage/StageUseCase.js';
import { extractFilters } from '../../infrastructure/utils/QueryHelper.js';

export class StageController {
  constructor(private stageUseCase: StageUseCase) {}

  async create(req: Request, res: Response) {
    try {
      const data = await this.stageUseCase.createStage(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const data = await this.stageUseCase.getStage(req.params.id as string, tenantId);
      res.json(data);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const filters = extractFilters(req.query);
      const data = await this.stageUseCase.getAllStages(tenantId, filters);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const data = await this.stageUseCase.updateStage(req.params.id as string, tenantId, req.body);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      await this.stageUseCase.deleteStage(req.params.id as string, tenantId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
