import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1),
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().int().min(0),
});

export const sellProductSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});

export const restockProductSchema = z.object({
  quantity: z.coerce.number().int().min(1),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    stock: z.coerce.number().int().min(0).optional(),
    price: z.coerce.number().int().min(0).optional(),
  })
  .refine((v) => v.name !== undefined || v.stock !== undefined || v.price !== undefined, {
    message: "At least one field is required",
  });
