import type { Request, Response } from 'express';
import { TaskUseCases } from '../../usecases/task/TaskUseCases.js';
import { respondWithError } from '../../infrastructure/utils/HttpErrorMapper.js';
import { validateTaskCreate, validateTaskUpdate } from '../validation/CrmRequestValidation.js';

export class TaskController {
  constructor(private taskUseCases: TaskUseCases) {}

  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) return res.status(401).json({ error: 'Tenant context missing' });
      const result = await this.taskUseCases.create(validateTaskCreate(req.body?.data ?? req.body), tenantId);
      return res.status(201).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const result = await this.taskUseCases.getById(req.params.id as string, tenantId);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const result = await this.taskUseCases.getAll(tenantId);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ error: 'User context missing' });
      const result = await this.taskUseCases.getTasksByUser(req, userId);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const result = await this.taskUseCases.update(
        req.params.id as string,
        validateTaskUpdate(req.body?.data ?? req.body),
        tenantId
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const result = await this.taskUseCases.delete(req.params.id as string, tenantId);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }
}
