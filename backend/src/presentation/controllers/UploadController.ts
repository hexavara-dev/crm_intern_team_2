import type { Request, Response } from 'express';
import { UploadUseCases } from '../../usecases/upload/UploadUseCases.js';
import { mapPrismaError } from '../../infrastructure/utils/PrismaErrorMapper.js';

export class UploadController {
  constructor(private uploadUseCases: UploadUseCases) {}

  async uploadCustomerDocument(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const tenantId = (req as any).user.tenantId;
      const result = await this.uploadUseCases.uploadCustomerDocument(
        req.params.id as string,
        req.file,
        tenantId
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }

  async uploadAttachment(req: Request, res: Response, entityType: 'lead' | 'deal') {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const tenantId = (req as any).user.tenantId;
      const result = await this.uploadUseCases.uploadAttachment(
        req.params.id as string,
        entityType,
        req.file,
        tenantId
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: mapPrismaError(error) });
    }
  }
}
