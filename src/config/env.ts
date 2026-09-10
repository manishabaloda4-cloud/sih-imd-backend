import dotenv from "dotenv";
dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    console.warn(`Warning: env var ${key} is not set`);
    return "";
  }
  return value;
}

export const env = {
  PORT: process.env.PORT || "5000",
  MONGODB_URI: required("MONGODB_URI"),
  CLERK_SECRET_KEY: required("CLERK_SECRET_KEY"),
  CLERK_PUBLISHABLE_KEY: required("CLERK_PUBLISHABLE_KEY"),
  FRONTEND_URL: process.env.FRONTEND_URL || "*",
  AI_API_KEY: process.env.AI_API_KEY || "",
  APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT || "",
  APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID || "",
  APPWRITE_API_KEY: process.env.APPWRITE_API_KEY || "",
  APPWRITE_BUCKET_ID: process.env.APPWRITE_BUCKET_ID || "",
};
