import type { Task, Prisma } from '@prisma/client';
import type { PrismaGenericRepository } from '../../infrastructure/repositories/PrismaGenericRepository.js';
import type { Request } from 'express';
import { extractFilters } from '../../infrastructure/utils/QueryHelper.js';

export class TaskUseCases {
  constructor(private taskRepository: PrismaGenericRepository<Task, Prisma.TaskDelegate>) {}

  private get defaultInclude() {
    return {
      assignedUser: { select: { id: true, name: true, email: true } },
      leadActivity: {
        select: {
          lead: {
            select: {
              id: true,
              customer: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
      },
      dealActivity: {
        select: {
          deal: {
            select: {
              lead: {
                select: {
                  id: true,
                  customer: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  async getTasksByUser(req: Request, userId: string) {
    const tenantId = (req as any).user?.tenantId;
    const filters = extractFilters(req.query);

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;

    const where: any = {
      assignedUserId: userId,
      ...(tenantId && { tenantId }),
      ...filters,
    };

    const [data, total] = await Promise.all([
      this.taskRepository.findAll({
        where,
        include: this.defaultInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.taskRepository.count(where),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: any) {
    return this.taskRepository.create(data);
  }
  async getById(id: string) {
    return this.taskRepository.findById(id, this.defaultInclude);
  }
  async getAll() {
    return this.taskRepository.findAll(this.defaultInclude);
  }
  async update(id: string, data: any) {
    return this.taskRepository.update(id, data);
  }
  async delete(id: string) {
    return this.taskRepository.delete(id);
  }
}
