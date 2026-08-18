import { z } from "zod";

const server = z.object({
  DATABASE_URL: z.string().min(1).default(
    "postgresql://postgres:2412917@aAbB@db.puwoxwelsllgifqcsasg.supabase.co:5432/postgres"
  ),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const client = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default("https://puwoxwelsllgifqcsasg.supabase.co"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional().default(""),
});

const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

const merged = server.merge(client);

let env = process.env;

if (!process.env.SKIP_ENV_VALIDATION) {
  const isServer = typeof window === "undefined";

  const parsed = isServer
    ? merged.safeParse(processEnv)
    : client.safeParse(processEnv);

  if (parsed.success) {
    env = parsed.data;
  } else {
    console.warn(
      "⚠️ Environment variable warning:",
      parsed.error.flatten().fieldErrors
    );
    env = {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://postgres:2412917@aAbB@db.puwoxwelsllgifqcsasg.supabase.co:5432/postgres",
      NODE_ENV: process.env.NODE_ENV || "development",
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "https://puwoxwelsllgifqcsasg.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
    };
  }
}

export { env };
