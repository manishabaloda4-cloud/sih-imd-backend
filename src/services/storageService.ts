import { env } from "../config/env";

// This is an abstraction layer so the file-storage provider can be swapped later
// without touching route/controller code. Currently targets Appwrite.
//
// NOTE: Actual Appwrite SDK wiring requires `npm install node-appwrite` and the
// APPWRITE_* env vars filled in. Until those are set, uploadFile() will throw a
// clear error instead of silently failing - this is intentional so the gap is
// obvious rather than hidden.

export interface UploadResult {
  fileId: string;
  url: string;
  filename: string;
  mimeType: string;
  size?: number;
}

function assertConfigured() {
  if (!env.APPWRITE_ENDPOINT || !env.APPWRITE_PROJECT_ID || !env.APPWRITE_API_KEY || !env.APPWRITE_BUCKET_ID) {
    throw new Error(
      "Appwrite is not configured. Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_BUCKET_ID in .env"
    );
  }
}

// Placeholder implementation - replace body with real node-appwrite Storage calls
// once the package is installed and env vars are set. Signature/shape below is
// what the rest of the app (Module upload routes) expects to call.
export async function uploadFile(fileBuffer: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
  assertConfigured();
  throw new Error(
    "uploadFile() is not yet implemented - install node-appwrite and wire the Storage.createFile() call here"
  );
}

export async function deleteFile(fileId: string): Promise<void> {
  assertConfigured();
  throw new Error(
    "deleteFile() is not yet implemented - install node-appwrite and wire the Storage.deleteFile() call here"
  );
}

export const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/vnd.ms-powerpoint", // ppt
];

export const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB
