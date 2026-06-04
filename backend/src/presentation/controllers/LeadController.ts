import type { Request, Response } from 'express';
import { LeadUseCases } from '../../usecases/lead/LeadUseCases.js';
import { mapPrismaError } from '../../infrastructure/utils/PrismaErrorMapper.js';
import { extractFilters } from '../../infrastructure/utils/QueryHelper.js';

export class LeadController {
  constructor(private leadUseCases: LeadUseCases) {}

  async create(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).user?.userId;
      const result = await this.leadUseCases.createLead(req.body, currentUserId);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const result = await this.leadUseCases.getLead(req.params.id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({ error: mapPrismaError(error) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const role = (req as any).user?.role;
      const currentUserId = (req as any).user?.userId;
      const result = await this.leadUseCases.updateLead(
        req.params.id as string,
        req.body,
        role,
        currentUserId
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await this.leadUseCases.deleteLead(req.params.id as string);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
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

      const result = await this.leadUseCases.getAllLeads(tenantId, page, limit, filters);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async convert(req: Request, res: Response) {
    try {
      const result = await this.leadUseCases.convertLeadToDeal(req.params.id as string, req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async setStatus(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant context missing' });
      }
      const result = await this.leadUseCases.setStatus(
        req.params.id as string,
        req.body.statusName,
        tenantId
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async setStage(req: Request, res: Response) {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        return res.status(401).json({ error: 'Tenant context missing' });
      }
      const result = await this.leadUseCases.setStage(
        req.params.id as string,
        req.body.stageName,
        tenantId
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }
}
