import { Client, Storage, Permission, Role, ID } from "node-appwrite";
import { env } from "../config/env";

// Real Appwrite wiring. Course/module video/PDF/PPT files are stored here;
// only the resulting URL + metadata are saved in MongoDB (never the binary itself).
// Uses the global File API (available Node 20+) instead of node-appwrite's
// InputFile helper, since InputFile's subpath import doesn't resolve cleanly
// under this project's CommonJS module resolution setup.

function getStorage(): Storage {
  const client = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT)
    .setProject(env.APPWRITE_PROJECT_ID)
    .setKey(env.APPWRITE_API_KEY);
  return new Storage(client);
}

export interface UploadResult {
  fileId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export async function uploadFile(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  const storage = getStorage();

  // Node's global File (Node 20+) - avoids node-appwrite's InputFile subpath import
  const file = new File([new Uint8Array(fileBuffer)], filename, { type: mimeType });

  const created = await storage.createFile({
    bucketId: env.APPWRITE_BUCKET_ID,
    fileId: ID.unique(),
    file,
    permissions: [Permission.read(Role.any())], // public read - anyone with the link can view/stream the file
  });

  const url = `${env.APPWRITE_ENDPOINT}/storage/buckets/${env.APPWRITE_BUCKET_ID}/files/${created.$id}/view?project=${env.APPWRITE_PROJECT_ID}`;

  return {
    fileId: created.$id,
    url,
    filename,
    mimeType,
    size: fileBuffer.length,
  };
}

export async function deleteFile(fileId: string): Promise<void> {
  const storage = getStorage();
  await storage.deleteFile({ bucketId: env.APPWRITE_BUCKET_ID, fileId });
}

export const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/vnd.ms-powerpoint", // ppt
];

export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB
