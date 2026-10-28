import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = 'uploads';

function resolveSafePath(filePath: string) {
  const normalized = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.split('/').includes('..')) {
    throw new Error('Invalid storage path');
  }
  const uploadsRoot = path.resolve(UPLOADS_DIR);
  const fullPath = path.resolve(uploadsRoot, normalized);
  if (fullPath !== uploadsRoot && !fullPath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new Error('Invalid storage path');
  }
  return { normalized, fullPath };
}

export const localStorage = {
  async upload(filePath: string, buffer: Buffer): Promise<void> {
    const { fullPath } = resolveSafePath(filePath);
    const dir = path.dirname(fullPath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(fullPath, buffer);
  },

  getFilePathFromPublicUrl(publicUrl: string): string {
    let pathname: string;
    try {
      pathname = new URL(publicUrl).pathname;
    } catch {
      throw new Error('Invalid stored file URL');
    }
    const marker = '/uploads/';
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex === -1) throw new Error('Stored file is not managed by local storage');
    const relativePath = decodeURIComponent(pathname.slice(markerIndex + marker.length));
    return resolveSafePath(relativePath).normalized;
  },

  async read(filePath: string): Promise<Buffer | null> {
    const { fullPath } = resolveSafePath(filePath);
    try {
      return await fs.promises.readFile(fullPath);
    } catch (error: any) {
      if (error?.code === 'ENOENT') return null;
      throw error;
    }
  },

  async removeStrict(filePath: string): Promise<boolean> {
    const { fullPath } = resolveSafePath(filePath);
    try {
      await fs.promises.unlink(fullPath);
      return true;
    } catch (error: any) {
      if (error?.code === 'ENOENT') return false;
      throw error;
    }
  },

  getPublicUrl(filePath: string): { publicUrl: string } {
    const baseUrl = process.env.DEV_BASE_URL || 'http://localhost:3000';
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedFilePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return {
      publicUrl: `${normalizedBaseUrl}/uploads/${normalizedFilePath}`,
    };
  },

  async remove(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        await this.removeStrict(filePath);
      } catch (err) {
        console.error(`Failed to delete local file ${filePath}:`, err);
      }
    }
  },
};
