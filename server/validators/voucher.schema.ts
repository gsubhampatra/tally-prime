import { z } from "zod";
import { VoucherType } from "@prisma/client";

export const VoucherItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  total: z.number().nonnegative(),
});

export const VoucherSchema = z.object({
  type: z.nativeEnum(VoucherType),
  date: z.union([z.date(), z.string().pipe(z.coerce.date())]),
  ledgerId: z.string().min(1, "Ledger is required"),
  offsetLedgerId: z.string().optional(), // Used for Cash/Bank in Receipt/Payment or Revenue/Expense
  totalAmount: z.number().positive(),
  note: z.string().optional(),
  items: z.array(VoucherItemSchema).optional(),
});

export type VoucherInput = z.infer<typeof VoucherSchema>;
