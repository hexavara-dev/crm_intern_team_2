import type { Request, Response } from 'express';
import { NoteUseCases } from '../../usecases/note/NoteUseCases.js';
import { mapPrismaError } from '../../infrastructure/utils/PrismaErrorMapper.js';

export class NoteController {
  constructor(private noteUseCases: NoteUseCases) {}

  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const data = { ...req.body, tenantId };
      const result = await this.noteUseCases.create(data);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await this.noteUseCases.getById(req.params.id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({ error: mapPrismaError(error) });
    }
  }

  async getAll(_req: Request, res: Response) {
    try {
      const result = await this.noteUseCases.getAll();
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await this.noteUseCases.update(req.params.id as string, req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await this.noteUseCases.delete(req.params.id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }
}
