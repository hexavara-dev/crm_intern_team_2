import { jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import { uploadTenantAccessMiddleware } from '../src/presentation/middlewares/UploadAccessMiddleware.js';

function createResponseMock() {
  const response: any = {};
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response as Response;
}

describe('uploadTenantAccessMiddleware', () => {
  it('allows a file path owned by the authenticated tenant', () => {
    const request = {
      path: '/tenant-1/lead/lead-1/document.pdf',
      user: { tenantId: 'tenant-1' },
    } as unknown as Request;
    const response = createResponseMock();
    const next = jest.fn() as NextFunction;

    uploadTenantAccessMiddleware(request, response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('hides files owned by another tenant', () => {
    const request = {
      path: '/tenant-2/lead/lead-1/document.pdf',
      user: { tenantId: 'tenant-1' },
    } as unknown as Request;
    const response = createResponseMock() as any;
    const next = jest.fn() as NextFunction;

    uploadTenantAccessMiddleware(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({ error: 'File not found.' });
  });

  it('rejects malformed encoded paths', () => {
    const request = {
      path: '/%E0%A4%A/document.pdf',
      user: { tenantId: 'tenant-1' },
    } as unknown as Request;
    const response = createResponseMock() as any;
    const next = jest.fn() as NextFunction;

    uploadTenantAccessMiddleware(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
  });
});
