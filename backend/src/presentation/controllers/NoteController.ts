import type { Request, Response } from 'express';
import { NoteUseCases } from '../../usecases/note/NoteUseCases.js';
import { respondWithError } from '../../infrastructure/utils/HttpErrorMapper.js';
import { validateNoteCreate, validateNoteUpdate } from '../validation/CrmRequestValidation.js';

export class NoteController {
  constructor(private noteUseCases: NoteUseCases) {}

  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) return res.status(401).json({ error: 'Tenant context missing' });
      const result = await this.noteUseCases.create(validateNoteCreate(req.body?.data ?? req.body), tenantId);
      return res.status(201).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const result = await this.noteUseCases.getById(req.params.id as string, tenantId);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const result = await this.noteUseCases.getAll(tenantId);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const result = await this.noteUseCases.update(
        req.params.id as string,
        validateNoteUpdate(req.body?.data ?? req.body),
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
      const result = await this.noteUseCases.delete(req.params.id as string, tenantId);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }
}
