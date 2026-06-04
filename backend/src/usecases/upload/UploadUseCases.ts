import { localStorage } from '../../infrastructure/storage/localStorage.js';
import type { IRepository } from '../../domain/repositories/IRepository.js';
import type { PrismaGenericRepository } from '../../infrastructure/repositories/PrismaGenericRepository.js';
import type { Attachment, Prisma } from '@prisma/client';

export class UploadUseCases {
  constructor(
    private customerRepo: IRepository<any>,
    private attachmentRepo?: PrismaGenericRepository<Attachment, Prisma.AttachmentDelegate>
  ) {}

  async uploadCustomerDocument(customerId: string, file: Express.Multer.File, tenantId: string) {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) throw new Error('Customer not found');
    if (customer.tenantId !== tenantId) throw new Error('Unauthorized for this tenant');

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${tenantId}/${customerId}/${fileName}`;

    await localStorage.upload(filePath, file.buffer);
    const { publicUrl } = localStorage.getPublicUrl(filePath);

    await this.customerRepo.update(customerId, {
      attachedDocument: publicUrl,
    });

    return {
      message: 'File uploaded successfully',
      url: publicUrl,
    };
  }

  async uploadAttachment(
    entityId: string,
    entityType: 'lead' | 'deal',
    file: Express.Multer.File,
    tenantId: string
  ) {
    if (!this.attachmentRepo) throw new Error('Attachment repository not initialized');

    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = `${tenantId}/${entityType}/${entityId}/${fileName}`;

    await localStorage.upload(filePath, file.buffer);
    const { publicUrl } = localStorage.getPublicUrl(filePath);

    const attachmentData: any = {
      tenant: { connect: { id: tenantId } },
      fileName: file.originalname,
      fileUrl: publicUrl,
      fileType: file.mimetype,
      fileSize: file.size,
    };

    if (entityType === 'lead') {
      attachmentData.lead = { connect: { id: entityId } };
    } else {
      attachmentData.deal = { connect: { id: entityId } };
    }

    const attachment = await this.attachmentRepo.create(attachmentData);

    return {
      message: 'File uploaded successfully',
      attachment,
    };
  }
}
