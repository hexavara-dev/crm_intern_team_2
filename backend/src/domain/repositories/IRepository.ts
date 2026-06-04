export interface IRepository<T> {
  modelName?: string;
  create(data: any): Promise<T>;
  findById(id: string, include?: any): Promise<T | null>;
  findOne(where: any, include?: any): Promise<T | null>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<T>;
  findAll(include?: any, where?: any): Promise<T[]>;
  count(where?: any): Promise<number>;
}
