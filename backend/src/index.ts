import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { prisma } from './infrastructure/database/prisma.js';
import { PrismaGenericRepository } from './infrastructure/repositories/PrismaGenericRepository.js';
import { GenericUseCases } from './usecases/GenericUseCases.js';
import { GenericController } from './presentation/controllers/GenericController.js';
import { LeadController } from './presentation/controllers/LeadController.js';
import { LeadUseCases } from './usecases/lead/LeadUseCases.js';
import { DealController } from './presentation/controllers/DealController.js';
import { DealUseCases } from './usecases/deal/DealUseCases.js';
import { AuthController } from './presentation/controllers/AuthController.js';
import { AuthUseCases } from './usecases/auth/AuthUseCases.js';
import { authMiddleware } from './presentation/middlewares/AuthMiddleware.js';
import { StatisticsUseCases } from './usecases/statistics/StatisticsUseCases.js';
import { StatisticsController } from './presentation/controllers/StatisticsController.js';
import multer from 'multer';
import { UploadUseCases } from './usecases/upload/UploadUseCases.js';
import { UploadController } from './presentation/controllers/UploadController.js';
import type { Attachment, Prisma } from '@prisma/client';

import { TaskUseCases } from './usecases/task/TaskUseCases.js';
import { TaskController } from './presentation/controllers/TaskController.js';
import { NoteUseCases } from './usecases/note/NoteUseCases.js';
import { NoteController } from './presentation/controllers/NoteController.js';
import { ViewingUseCase } from './usecases/viewing/ViewingUseCase.js';
import { ViewingController } from './presentation/controllers/ViewingController.js';
import { StatusUseCase } from './usecases/status/StatusUseCase.js';
import { StatusController } from './presentation/controllers/StatusController.js';
import { StageUseCase } from './usecases/stage/StageUseCase.js';
import { StageController } from './presentation/controllers/StageController.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Specialized Upload Setup
const upload = multer({ storage: multer.memoryStorage() });
const customerDelegate = (prisma as any).customer;
const customerRepoForUpload = new PrismaGenericRepository<any, any>(customerDelegate, 'customer');
const attachmentDelegate = (prisma as any).attachment;
const attachmentRepo = new PrismaGenericRepository<Attachment, Prisma.AttachmentDelegate>(
  attachmentDelegate,
  'attachment'
);
const uploadUseCases = new UploadUseCases(customerRepoForUpload, attachmentRepo);
const uploadController = new UploadController(uploadUseCases);

app.post('/api/customer/:id/upload', authMiddleware, upload.single('document'), (req, res) =>
  uploadController.uploadCustomerDocument(req, res)
);
app.post('/api/lead/:id/upload', authMiddleware, upload.single('document'), (req, res) =>
  uploadController.uploadAttachment(req, res, 'lead')
);
app.post('/api/deal/:id/upload', authMiddleware, upload.single('document'), (req, res) =>
  uploadController.uploadAttachment(req, res, 'deal')
);

// List of standard Prisma models from schema defined internally
const models = [
  'tenant',
  'user',
  'invite',
  'stage',
  'status',
  'source',
  'organization',
  'customer',
  'lead',
  'leadItem',
  'deal',
  'leadActivity',
  'dealActivity',
  'note',
  'task',
  'callLog',
  'itemCategory',
  'item',
  'location',
  'inventorySlot',
  'gridConfig',
  'entry',
  'operation',
  'record',
  'viewing',
  'attachment',
  'auditLog',
];

// Pre-instantiate repositories to handle cross-dependencies
const repositories: Record<string, PrismaGenericRepository<any>> = {};
models.forEach((modelName) => {
  const delegate = (prisma as any)[modelName];
  if (delegate) {
    repositories[modelName] = new PrismaGenericRepository(delegate, modelName);
  }
});

const requireRepository = (modelName: string): PrismaGenericRepository<any> => {
  const repository = repositories[modelName];
  if (!repository) {
    throw new Error(`Repository not found for model: ${modelName}`);
  }
  return repository;
};

// Specialized Auth Setup
const authUseCases = new AuthUseCases(
  requireRepository('user'),
  requireRepository('invite'),
  requireRepository('tenant'),
  requireRepository('status')
);
const authController = new AuthController(authUseCases);

app.post('/api/auth/login', (req, res) => authController.login(req, res));
app.post('/api/auth/register', (req, res) => authController.register(req, res));
app.post('/api/auth/onboard', (req, res) => authController.onboard(req, res));
app.get('/api/auth/me', authMiddleware, (req, res) => authController.getMe(req, res));
app.put('/api/auth/update-account', authMiddleware, (req, res) =>
  authController.updateAccount(req, res)
);

// Specialized Statistics Setup
const statisticsUseCases = new StatisticsUseCases(prisma as any);
const statisticsController = new StatisticsController(statisticsUseCases);
app.get('/api/statistics', authMiddleware, (req, res) =>
  statisticsController.getStatistics(req, res)
);

// Setup dynamic routes
const modelIncludes: Record<string, any> = {
  customer: { organization: true },
  organization: {},
  deal: {
    lead: { include: { customer: { include: { organization: true } } } },
    status: true,
    stage: true,
    source: true,
    assignedUser: true,
    attachments: true,
  },
  lead: {
    customer: { include: { organization: true } },
    status: true,
    stage: true,
    source: true,
    attachments: true,
  },
  viewing: {
    source: true,
    status: true,
    location: true,
    actor: { select: { id: true, name: true, email: true } },
  },
  task: {
    assignedUser: true,
    leadActivity: true,
    dealActivity: true,
  },
};

models.forEach((modelName) => {
  const repo = repositories[modelName];
  if (!repo) return;

  let controller: any;
  const routeName = modelName.toLowerCase();
  const include = modelIncludes[modelName] || undefined;

  if (modelName === 'lead') {
    const useCases = new LeadUseCases(
      repo,
      requireRepository('deal'),
      requireRepository('leadActivity'),
      requireRepository('status'),
      requireRepository('stage'),
      requireRepository('customer'),
      requireRepository('auditLog')
    );
    controller = new LeadController(useCases);
    app.post(`/api/${routeName}/:id/convert`, authMiddleware, (req, res) =>
      controller.convert(req, res)
    );
    app.post(`/api/${routeName}/:id/set-status`, authMiddleware, (req, res) =>
      controller.setStatus(req, res)
    );
    app.post(`/api/${routeName}/:id/set-stage`, authMiddleware, (req, res) =>
      controller.setStage(req, res)
    );
  } else if (modelName === 'deal') {
    const useCases = new DealUseCases(repo, requireRepository('dealActivity'));
    controller = new DealController(useCases);
  } else if (modelName === 'task') {
    const useCases = new TaskUseCases(repo);
    controller = new TaskController(useCases);
  } else if (modelName === 'note') {
    const useCases = new NoteUseCases(repo);
    controller = new NoteController(useCases);
  } else if (modelName === 'stage') {
    const useCases = new StageUseCase(repo);
    controller = new StageController(useCases);
    app.put(`/api/${routeName}/reorder`, authMiddleware, (req, res) => controller.update(req, res));
  } else if (modelName === 'status') {
    const useCases = new StatusUseCase(repo);
    controller = new StatusController(useCases);
  } else if (modelName === 'viewing') {
    const useCases = new ViewingUseCase(
      repo,
      requireRepository('status'),
      requireRepository('attachment'),
      prisma
    );
    controller = new ViewingController(useCases);
    app.post(
      `/api/${routeName}/:id/upload-evidence`,
      authMiddleware,
      upload.single('evidence'),
      (req, res) => controller.uploadEvidence(req, res)
    );
    app.post(`/api/${routeName}/:id/fail`, authMiddleware, (req, res) => controller.fail(req, res));
  } else {
    const useCases = new GenericUseCases(repo);
    controller = new GenericController(useCases, include);
  }

  app.post(`/api/${routeName}`, authMiddleware, (req, res) => controller.create(req, res));
  app.get(`/api/${routeName}`, authMiddleware, (req, res) => controller.getAll(req, res));
  if (typeof (controller as any).getMe === 'function') {
    app.get(`/api/${routeName}/me`, authMiddleware, (req, res) =>
      (controller as any).getMe(req, res)
    );
  }
  app.get(`/api/${routeName}/:id`, authMiddleware, (req, res) => controller.getById(req, res));
  app.put(`/api/${routeName}/:id`, authMiddleware, (req, res) => controller.update(req, res));
  app.delete(`/api/${routeName}/:id`, authMiddleware, (req, res) => controller.delete(req, res));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hexavara CRM API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running internally on port ${PORT}`);
});
