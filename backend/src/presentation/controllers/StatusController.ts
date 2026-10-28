import type { Request, Response } from 'express';
import { StatusUseCase } from '../../usecases/status/StatusUseCase.js';
import { extractFilters } from '../../infrastructure/utils/QueryHelper.js';
import { respondWithError } from '../../infrastructure/utils/HttpErrorMapper.js';
import { validateStatusCreate, validateStatusUpdate } from '../validation/CrmRequestValidation.js';

export class StatusController {
  constructor(private statusUseCase: StatusUseCase) {}

  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const body = validateStatusCreate(req.body);
      const data = await this.statusUseCase.createStatus({ ...body, tenantId } as any);
      res.status(201).json(data);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const data = await this.statusUseCase.getStatus(req.params.id as string, tenantId);
      res.json(data);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const filters = extractFilters(req.query);
      const data = await this.statusUseCase.getAllStatuses(tenantId, filters);
      res.json(data);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const body = validateStatusUpdate(req.body);
      const data = await this.statusUseCase.updateStatus(
        req.params.id as string,
        tenantId,
        body as any
      );
      res.json(data);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      await this.statusUseCase.deleteStatus(req.params.id as string, tenantId);
      res.status(204).send();
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }
}
