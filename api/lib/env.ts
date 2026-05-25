import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId:          required("APP_ID"),
  appSecret:      required("APP_SECRET"),
  refreshSecret:  process.env.REFRESH_SECRET || required("APP_SECRET"),
  databaseUrl:    required("DATABASE_URL"),
  kimiAuthUrl:    required("KIMI_AUTH_URL"),
  kimiOpenUrl:    required("KIMI_OPEN_URL"),
  ownerUnionId:   process.env.OWNER_UNION_ID ?? "",
  allowedOrigins: process.env.ALLOWED_ORIGINS ?? "http://localhost:3000",
  appUrl:         process.env.APP_URL ?? "http://localhost:3000",
  logLevel:       process.env.LOG_LEVEL ?? "info",
  nodeEnv:        process.env.NODE_ENV ?? "development",
  isProduction:   process.env.NODE_ENV === "production",
};
