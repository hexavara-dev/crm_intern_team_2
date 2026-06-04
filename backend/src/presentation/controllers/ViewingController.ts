import type { Request, Response } from 'express';
import { ViewingUseCase } from '../../usecases/viewing/ViewingUseCase.js';
import { extractFilters } from '../../infrastructure/utils/QueryHelper.js';

export class ViewingController {
  constructor(private viewingUseCase: ViewingUseCase) {}

  async create(req: Request, res: Response) {
    try {
      const data = await this.viewingUseCase.createViewing(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const data = await this.viewingUseCase.getViewing(req.params.id as string, tenantId);
      res.json(data);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { page, limit } = req.query;
      const filters = extractFilters(req.query);
      const data = await this.viewingUseCase.getAllViewings(
        tenantId,
        Number(page) || 1,
        Number(limit) || 10,
        filters
      );
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const data = await this.viewingUseCase.updateViewing(
        req.params.id as string,
        tenantId,
        req.body
      );
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      await this.viewingUseCase.deleteViewing(req.params.id as string, tenantId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async uploadEvidence(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const file = req.file;

      if (!file) {
        throw new Error('No file uploaded');
      }

      const result = await this.viewingUseCase.uploadEvidence(
        req.params.id as string,
        tenantId,
        file,
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async fail(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user;
      const { reason } = req.body;
      const result = await this.viewingUseCase.failViewing(
        req.params.id as string,
        tenantId,
        reason
      );
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
