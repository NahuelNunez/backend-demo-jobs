import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("3000"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  FRONTEND_URL: z.string().url(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
});

export const env = envSchema.parse(process.env);

// Exportar también como config para compatibilidad
export const config = env;
