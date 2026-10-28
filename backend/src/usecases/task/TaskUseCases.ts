import type { Task, Prisma, PrismaClient } from '@prisma/client';
import type { PrismaGenericRepository } from '../../infrastructure/repositories/PrismaGenericRepository.js';
import type { Request } from 'express';
import { extractFilters } from '../../infrastructure/utils/QueryHelper.js';

export class TaskUseCases {
  constructor(
    private taskRepository: PrismaGenericRepository<Task, Prisma.TaskDelegate>,
    private prisma?: PrismaClient
  ) {}

  private async validateRelations(data: Record<string, any>, tenantId: string) {
    if (!this.prisma) return;
    const [assignedUser, leadActivity, dealActivity] = await Promise.all([
      data.assignedUserId
        ? this.prisma.user.findFirst({ where: { id: data.assignedUserId, tenantId }, select: { id: true } })
        : undefined,
      data.leadActivityId
        ? this.prisma.leadActivity.findFirst({ where: { id: data.leadActivityId, tenantId }, select: { id: true } })
        : undefined,
      data.dealActivityId
        ? this.prisma.dealActivity.findFirst({ where: { id: data.dealActivityId, tenantId }, select: { id: true } })
        : undefined,
    ]);
    if (data.assignedUserId && !assignedUser) throw new Error('Assigned user not found');
    if (data.leadActivityId && !leadActivity) throw new Error('Lead activity not found');
    if (data.dealActivityId && !dealActivity) throw new Error('Deal activity not found');
  }

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

  async create(data: any, tenantId: string) {
    const payload = { ...(data.data ?? data), tenantId };
    await this.validateRelations(payload, tenantId);
    return this.taskRepository.create(payload);
  }
  async getById(id: string, tenantId: string) {
    const task = await this.taskRepository.findOne({ id, tenantId }, this.defaultInclude);
    if (!task) throw new Error('Task not found');
    return task;
  }
  async getAll(tenantId: string) {
    return this.taskRepository.findAll({ where: { tenantId }, include: this.defaultInclude });
  }
  async update(id: string, data: any, tenantId: string) {
    await this.getById(id, tenantId);
    const payload = { ...(data.data ?? data) };
    await this.validateRelations(payload, tenantId);
    return this.taskRepository.update(id, payload);
  }
  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.taskRepository.delete(id);
  }
}
