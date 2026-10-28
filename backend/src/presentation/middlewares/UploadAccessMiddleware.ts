import type { NextFunction, Request, Response } from 'express';

export function uploadTenantAccessMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const tenantId = (req as any).user?.tenantId;
  if (!tenantId) return res.status(401).json({ error: 'Authentication is required.' });

  const encodedTenantSegment = req.path.split('/').filter(Boolean)[0];
  if (!encodedTenantSegment) return res.status(404).json({ error: 'File not found.' });

  let pathTenantId: string;
  try {
    pathTenantId = decodeURIComponent(encodedTenantSegment);
  } catch {
    return res.status(400).json({ error: 'Invalid file path.' });
  }

  if (pathTenantId !== tenantId) {
    return res.status(404).json({ error: 'File not found.' });
  }

  return next();
}
