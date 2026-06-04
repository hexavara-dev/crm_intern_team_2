import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = 'uploads';

export const localStorage = {
  async upload(filePath: string, buffer: Buffer): Promise<void> {
    const fullPath = path.join(UPLOADS_DIR, filePath);
    const dir = path.dirname(fullPath);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(fullPath, buffer);
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
      const fullPath = path.join(UPLOADS_DIR, filePath);
      try {
        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
        }
      } catch (err) {
        console.error(`Failed to delete local file ${filePath}:`, err);
      }
    }
  },
};
