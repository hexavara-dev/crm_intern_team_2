import type { Request, Response } from 'express';
import type { StatisticsUseCases } from '../../usecases/statistics/StatisticsUseCases.js';
import { mapPrismaError } from '../../infrastructure/utils/PrismaErrorMapper.js';

export class StatisticsController {
  constructor(private statisticsUseCases: StatisticsUseCases) {}

  async getStatistics(req: Request, res: Response) {
    try {
      // 1. Get tenantId from decoded JWT user object
      const user = (req as any).user;
      if (!user || (!user.tenantId && !user.tenant_id)) {
        return res.status(401).json({ error: 'Tenant not identified in session' });
      }

      const tenantId = user.tenantId || user.tenant_id;

      let dateRange: { start?: Date; end?: Date } | undefined;
      if (req.query.startDate && req.query.endDate) {
        dateRange = {
          start: new Date(req.query.startDate as string),
          end: new Date(req.query.endDate as string),
        };
      }

      // 2. Call UseCase logic
      const stats = await this.statisticsUseCases.getStatistics(tenantId, dateRange);

      // 3. Return results
      return res.status(200).json(stats);
    } catch (error: any) {
      console.error('Error in StatisticsController.getStatistics:', error);
      return res.status(500).json({ error: mapPrismaError(error) });
    }
  }
}
