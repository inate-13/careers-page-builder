// schemas/company.ts
import { z } from 'zod';

export const ThemeSchema = z.object({
  primary_color: z.string().min(3).max(9).nullable().optional(),
  accent_color: z.string().min(3).max(9).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  culture_video_url: z.string().url().nullable().optional(),
});

export const AboutSectionSchema = z.object({
  title: z.string().min(1).max(120).nullable().optional(),
  content: z.string().max(5000).nullable().optional(),
});

export const SaveCompanyPayload = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3),
  tagline: z.string().max(140).nullable().optional(),
  website: z.string().url().nullable().optional(),
  theme: ThemeSchema.optional(),
  about: AboutSectionSchema.optional(),
});

export type SaveCompanyPayloadT = z.infer<typeof SaveCompanyPayload>;
