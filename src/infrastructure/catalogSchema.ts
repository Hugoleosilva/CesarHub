import { z } from 'zod';
import { CatalogValidationError } from '../domain/errors';
import type { Catalog } from '../domain/service';

const contactSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1).optional(),
  email: z.string().email().optional(),
  slack: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
});

const guideSchema = z.object({
  where: z.string().min(1).optional(),
  url: z.string().url().optional(),
  contactsIntro: z.string().min(1).optional(),
  cases: z.array(z.object({ title: z.string().min(1), steps: z.array(z.string().min(1)).min(1) })).default([]),
  contacts: z.array(contactSchema).default([]),
});

const serviceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url(),
  image: z.string().min(1),
  type: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  topics: z.array(z.string().min(1)).default([]),
  featured: z.boolean().default(false),
  guide: guideSchema.optional(),
});

const catalogSchema = z
  .array(z.object({ category: z.string().min(1), guideImage: z.string().min(1).optional(), items: z.array(serviceSchema) }))
  .superRefine((categories, ctx) => {
    const seen = new Set<string>();
    categories.forEach((category, c) =>
      category.items.forEach((item, i) => {
        if (seen.has(item.id)) {
          ctx.addIssue({ code: 'custom', message: `id duplicado "${item.id}"`, path: [c, 'items', i, 'id'] });
        }
        seen.add(item.id);
      }),
    );
  });

export function parseCatalog(raw: unknown): Catalog {
  const result = catalogSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new CatalogValidationError(issues);
  }
  return result.data.map(({ category, guideImage, items }) => ({ name: category, guideImage, items }));
}
