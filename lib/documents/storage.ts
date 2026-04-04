import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type StoredObject = {
  storagePath: string;
  absolutePath: string;
  fileSizeBytes: number;
  fileName: string;
  fileType: string;
};

export interface DocumentStorage {
  saveFile(input: {
    userId: string;
    fileName: string;
    fileType: string;
    bytes: Buffer;
  }): Promise<StoredObject>;
  readFile(storagePath: string): Promise<Buffer>;
  deleteFile(storagePath: string): Promise<void>;
}

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function resolveUploadRoot() {
  const configured = process.env.UPLOAD_DIR ?? "./storage/uploads";
  return path.resolve(process.cwd(), configured);
}

class LocalDocumentStorage implements DocumentStorage {
  private readonly rootDir = resolveUploadRoot();

  async saveFile(input: {
    userId: string;
    fileName: string;
    fileType: string;
    bytes: Buffer;
  }): Promise<StoredObject> {
    const userDir = path.join(this.rootDir, sanitizeSegment(input.userId));
    await mkdir(userDir, { recursive: true });

    const extension = path.extname(input.fileName);
    const baseName = path.basename(input.fileName, extension);
    const safeFileName = `${sanitizeSegment(baseName)}-${randomUUID()}${extension.toLowerCase()}`;
    const absolutePath = path.join(userDir, safeFileName);

    await writeFile(absolutePath, input.bytes);

    return {
      storagePath: path.relative(process.cwd(), absolutePath).replace(/\\/g, "/"),
      absolutePath,
      fileSizeBytes: input.bytes.byteLength,
      fileName: input.fileName,
      fileType: input.fileType,
    };
  }

  async deleteFile(storagePath: string): Promise<void> {
    const absolutePath = path.resolve(process.cwd(), storagePath);

    if (!absolutePath.startsWith(this.rootDir)) {
      return;
    }

    try {
      await unlink(absolutePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  async readFile(storagePath: string): Promise<Buffer> {
    const absolutePath = path.resolve(process.cwd(), storagePath);

    if (!absolutePath.startsWith(this.rootDir)) {
      throw new Error("Refusing to read a file outside the configured upload directory.");
    }

    return readFile(absolutePath);
  }
}

const localDocumentStorage = new LocalDocumentStorage();

export function getDocumentStorage(): DocumentStorage {
  return localDocumentStorage;
}
