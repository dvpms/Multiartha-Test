import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1),
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().int().min(0),
});

export const sellProductSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});
