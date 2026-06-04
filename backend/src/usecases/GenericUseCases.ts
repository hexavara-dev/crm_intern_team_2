import type { Request } from 'express';
import type { IRepository } from '../domain/repositories/IRepository.js';
import { extractFilters } from '../infrastructure/utils/QueryHelper.js';

export class GenericUseCases {
  constructor(private repository: IRepository<any>) {}

  private sanitize(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }
    if (data !== null && typeof data === 'object') {
      if (data instanceof Date) return data;
      const sanitized = { ...data };
      if ('password' in sanitized) {
        delete sanitized.password;
      }
      for (const key in sanitized) {
        sanitized[key] = this.sanitize(sanitized[key]);
      }
      return sanitized;
    }
    return data;
  }

  async create(req: Request, dto: any) {
    if (!dto) {
      throw new Error('Missing request body');
    }
    const tenantId = (req as any).user?.tenantId;
    if (tenantId) {
      if (dto.data) {
        if (!dto.data.tenantId && !dto.data.tenant) {
          dto.data.tenantId = tenantId;
        }
      } else {
        if (!dto.tenantId && !dto.tenant) {
          dto.tenantId = tenantId;
        }
      }
    }
    const result = await this.repository.create(dto);
    return this.sanitize(result);
  }

  async getById(id: string, include?: any) {
    const record = await this.repository.findById(id, include);
    if (!record) {
      throw new Error('Record not found');
    }
    return this.sanitize(record);
  }

  async update(id: string, dto: any) {
    if (!dto) {
      throw new Error('Missing update payload');
    }
    const result = await this.repository.update(id, dto);
    return this.sanitize(result);
  }

  async delete(id: string) {
    const result = await this.repository.delete(id);
    return this.sanitize(result);
  }

  async getAll(req: Request, include?: any) {
    const tenantId = (req as any).user?.tenantId;
    const filters = extractFilters(req.query);

    if (!req.query.page && !req.query.limit) {
      const where: any = tenantId ? { tenantId, ...filters } : { ...filters };
      const datawithoutpagination = await this.repository.findAll(include, where);
      return {
        data: this.sanitize(datawithoutpagination),
      };
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;

    const where: any = tenantId ? { tenantId, ...filters } : { ...filters };
    const modelName = (this.repository as any).modelName;

    const modelsWithCreatedAt = [
      'tenant',
      'user',
      'customer',
      'lead',
      'leaditem',
      'deal',
      'leadactivity',
      'dealactivity',
      'item',
      'location',
      'operation',
      'record',
      'viewing',
      'attachment',
      'auditlog',
    ];

    const applyOrderBy = modelsWithCreatedAt.includes(modelName.toLowerCase());

    const [data, total] = await Promise.all([
      this.repository.findAll({
        where,
        include,
        skip,
        take: limit,
        orderBy: applyOrderBy ? { createdAt: 'desc' } : undefined,
      }),
      (this.repository as any).count(where),
    ]);

    return {
      data: this.sanitize(data),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
