import type { Request, Response } from 'express';
import { GenericUseCases } from '../../usecases/GenericUseCases.js';
import { mapPrismaError } from '../../infrastructure/utils/PrismaErrorMapper.js';

export class GenericController {
  constructor(
    private useCases: GenericUseCases,
    private include?: any
  ) {}

  async create(req: Request, res: Response) {
    try {
      const result = await this.useCases.create(req, req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await this.useCases.getById(req.params.id as string, this.include);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({ error: mapPrismaError(error) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await this.useCases.update(req.params.id as string, req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await this.useCases.delete(req.params.id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const result = await this.useCases.getAll(req, this.include);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }
}
