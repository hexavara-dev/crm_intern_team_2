import type { Note, Prisma } from '@prisma/client';
import type { PrismaGenericRepository } from '../../infrastructure/repositories/PrismaGenericRepository.js';

export class NoteUseCases {
  constructor(private noteRepository: PrismaGenericRepository<Note, Prisma.NoteDelegate>) {}

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

  async create(data: any) {
    return this.noteRepository.create(data);
  }

  async getById(id: string) {
    return this.noteRepository.findById(id, this.defaultInclude);
  }

  async getAll() {
    return this.noteRepository.findAll(this.defaultInclude);
  }

  async update(id: string, data: any) {
    return this.noteRepository.update(id, data);
  }
  async delete(id: string) {
    return this.noteRepository.delete(id);
  }
}
