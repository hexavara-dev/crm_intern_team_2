import type { Request, Response } from 'express';
import { DealUseCases } from '../../usecases/deal/DealUseCases.js';
import { respondWithError } from '../../infrastructure/utils/HttpErrorMapper.js';
import { extractFilters } from '../../infrastructure/utils/QueryHelper.js';
import { parsePagination, parseSearch } from '../../infrastructure/utils/RequestValidation.js';
import { validateDealCreate, validateDealUpdate } from '../validation/CrmRequestValidation.js';

export class DealController {
  constructor(private dealUseCases: DealUseCases) {}

  async create(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const body = validateDealCreate(req.body);
      const result = await this.dealUseCases.createDeal({ ...body, tenantId } as any);
      return res.status(201).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const result = await this.dealUseCases.getDeal(req.params.id as string, tenantId);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { tenantId } = (req as any).user || {};
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant context missing' });
      }

      const { page, limit } = parsePagination(req.query as Record<string, unknown>);
      const search = parseSearch(req.query as Record<string, unknown>);
      const filters = extractFilters(req.query);

      const result = await this.dealUseCases.getAllDeals(tenantId, page, limit, filters, search);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const body = validateDealUpdate(req.body);
      const result = await this.dealUseCases.updateDeal(req.params.id as string, body as any, tenantId);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      const result = await this.dealUseCases.deleteDeal(req.params.id as string, tenantId);
      return res.status(200).json(result);
    } catch (error: any) {
      return respondWithError(res, error);
    }
  }
}
