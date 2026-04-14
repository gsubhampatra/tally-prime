"use server";

import { db } from "@/lib/db";
import { z } from "zod";

const LedgerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CUSTOMER", "SUPPLIER", "CASH", "BANK"]),
  phone: z.string().optional(),
});

export type LedgerInput = z.infer<typeof LedgerSchema>;

export async function createLedgerAction(data: LedgerInput) {
  try {
    const parsed = LedgerSchema.parse(data);
    const ledger = await db.ledger.create({ data: parsed });
    return { success: true, data: ledger };
  } catch (error: any) {
    console.error("Ledger Creation Error:", error);
    return { success: false, error: error.message || "Failed to create ledger" };
  }
}

export async function updateLedgerAction(ledgerId: string, data: LedgerInput) {
  try {
    const parsed = LedgerSchema.parse(data);
    const ledger = await db.ledger.update({
      where: { id: ledgerId },
      data: parsed,
    });
    return { success: true, data: ledger };
  } catch (error: any) {
    console.error("Ledger Update Error:", error);
    return { success: false, error: error.message || "Failed to update ledger" };
  }
}

export async function getLedgersAction(type?: string) {
  const where = type ? { type: type as any } : {};
  return db.ledger.findMany({ where, orderBy: { name: "asc" } });
}

export async function getLedgerAction(ledgerId: string) {
  return db.ledger.findUnique({
    where: { id: ledgerId },
  });
}

export async function getLedgerWithBalanceAction(ledgerId: string) {
  const ledger = await db.ledger.findUnique({
    where: { id: ledgerId },
    include: {
      entries: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!ledger) return null;

  const totals = await db.ledgerEntry.aggregate({
    where: { ledgerId },
    _sum: { debit: true, credit: true },
  });

  const balance = (totals._sum.debit || 0) - (totals._sum.credit || 0);

  return { ...ledger, balance };
}
