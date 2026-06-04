import type { Request, Response } from 'express';
import { TaskUseCases } from '../../usecases/task/TaskUseCases.js';
import { mapPrismaError } from '../../infrastructure/utils/PrismaErrorMapper.js';

export class TaskController {
  constructor(private taskUseCases: TaskUseCases) {}

  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const data = { ...req.body, tenantId };
      const result = await this.taskUseCases.create(data);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await this.taskUseCases.getById(req.params.id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({ error: mapPrismaError(error) });
    }
  }

  async getAll(_req: Request, res: Response) {
    try {
      const result = await this.taskUseCases.getAll();
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ error: 'User context missing' });
      const result = await this.taskUseCases.getTasksByUser(req, userId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await this.taskUseCases.update(req.params.id as string, req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await this.taskUseCases.delete(req.params.id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }
}
