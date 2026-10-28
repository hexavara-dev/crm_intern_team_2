import type { Note, Prisma, PrismaClient } from '@prisma/client';
import type { PrismaGenericRepository } from '../../infrastructure/repositories/PrismaGenericRepository.js';

export class NoteUseCases {
  constructor(
    private noteRepository: PrismaGenericRepository<Note, Prisma.NoteDelegate>,
    private prisma?: PrismaClient
  ) {}

  private async validateRelations(data: Record<string, any>, tenantId: string) {
    if (!this.prisma) return;
    const [leadActivity, dealActivity] = await Promise.all([
      data.leadActivityId
        ? this.prisma.leadActivity.findFirst({
            where: { id: data.leadActivityId, tenantId },
            select: { id: true },
          })
        : undefined,
      data.dealActivityId
        ? this.prisma.dealActivity.findFirst({
            where: { id: data.dealActivityId, tenantId },
            select: { id: true },
          })
        : undefined,
    ]);
    if (data.leadActivityId && !leadActivity) throw new Error('Lead activity not found');
    if (data.dealActivityId && !dealActivity) throw new Error('Deal activity not found');
  }

  private get defaultInclude() {
    return {
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

  async create(data: any, tenantId: string) {
    const payload = { ...(data.data ?? data), tenantId };
    await this.validateRelations(payload, tenantId);
    return this.noteRepository.create(payload);
  }

  async getById(id: string, tenantId: string) {
    const note = await this.noteRepository.findOne({ id, tenantId }, this.defaultInclude);
    if (!note) throw new Error('Note not found');
    return note;
  }

  async getAll(tenantId: string) {
    return this.noteRepository.findAll({ where: { tenantId }, include: this.defaultInclude });
  }

  async update(id: string, data: any, tenantId: string) {
    await this.getById(id, tenantId);
    const payload = { ...(data.data ?? data) };
    await this.validateRelations(payload, tenantId);
    return this.noteRepository.update(id, payload);
  }
  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.noteRepository.delete(id);
  }
}
