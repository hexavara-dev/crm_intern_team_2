import type { Request, Response } from 'express';
import { DealUseCases } from '../../usecases/deal/DealUseCases.js';
import { mapPrismaError } from '../../infrastructure/utils/PrismaErrorMapper.js';
import { extractFilters } from '../../infrastructure/utils/QueryHelper.js';

export class DealController {
  constructor(private dealUseCases: DealUseCases) {}

  async create(req: Request, res: Response) {
    try {
      const result = await this.dealUseCases.createDeal(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await this.dealUseCases.getDeal(req.params.id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({ error: mapPrismaError(error) });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user || {};
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant context missing' });
      }

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const filters = extractFilters(req.query);

      const result = await this.dealUseCases.getAllDeals(tenantId, page, limit, filters);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const result = await this.dealUseCases.updateDeal(req.params.id as string, req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await this.dealUseCases.deleteDeal(req.params.id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }
}
