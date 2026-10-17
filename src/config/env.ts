import { z } from "zod";

const envSchema = z
  .object({
    NEXT_PUBLIC_DATA_SOURCE: z.enum(["mock", "supabase"]).default("mock"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NEXT_PUBLIC_DATA_SOURCE === "supabase" && (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi saat DATA_SOURCE=supabase",
      });
    }
  });

/** Variabel NEXT_PUBLIC_* harus dibaca satu per satu agar ikut di-bundle Next.js. */
export const env = envSchema.parse({
  NEXT_PUBLIC_DATA_SOURCE: process.env.NEXT_PUBLIC_DATA_SOURCE || undefined,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
