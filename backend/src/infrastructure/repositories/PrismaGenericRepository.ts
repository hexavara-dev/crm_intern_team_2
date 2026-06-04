import type { IRepository } from '../../domain/repositories/IRepository.js';

export class PrismaGenericRepository<T, D = any> implements IRepository<T> {
  modelName: string = '';

  constructor(
    public delegate: D,
    modelName?: string
  ) {
    this.modelName = modelName || '';
  }

  async create(data: any): Promise<T> {
    return (this.delegate as any).create({ data });
  }

  async findById(id: string, include?: any): Promise<T | null> {
    return (this.delegate as any).findUnique({ where: { id }, include });
  }

  async findOne(where: any, include?: any): Promise<T | null> {
    return (this.delegate as any).findFirst({ where, include });
  }

  async update(id: string, data: any): Promise<T> {
    // Check if data already has 'data' wrapper
    if (data.data) {
      return (this.delegate as any).update(data);
    }
    return (this.delegate as any).update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return (this.delegate as any).delete({ where: { id } });
  }

  async findAll(options: any = {}): Promise<T[]> {
    // Backward compatibility: if the first arg is an include object and second is where
    if (arguments.length > 1 || (options && !options.include && !options.where && !options.take)) {
      const include = arguments[0];
      const where = arguments[1];
      return (this.delegate as any).findMany({ where, include });
    }
    return (this.delegate as any).findMany(options);
  }

  async count(where: any = {}): Promise<number> {
    return (this.delegate as any).count({ where });
  }
}
