import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  refreshSecret: process.env.REFRESH_SECRET || required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: required("KIMI_AUTH_URL"),
  kimiOpenUrl: required("KIMI_OPEN_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  allowedOrigins: process.env.ALLOWED_ORIGINS ?? "http://localhost:3000",
  redisUrl: process.env.REDIS_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseKey: process.env.SUPABASE_KEY ?? "",
  mongoUrl: process.env.MONGO_URL ?? "",
  sentryDsn: process.env.SENTRY_DSN ?? "",
  logLevel: process.env.LOG_LEVEL ?? "info",
  nodeEnv: process.env.NODE_ENV ?? "development",
  awsRegion: process.env.AWS_REGION ?? "us-east-1",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsBucket: process.env.AWS_BUCKET ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "noreply@nexusai.com",
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
};
