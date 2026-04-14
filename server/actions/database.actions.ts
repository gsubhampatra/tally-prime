"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function resetStockAction() {
  const result = await db.stockMove.deleteMany();

  revalidatePath("/");
  revalidatePath("/inventory/items");
  revalidatePath("/reports");

  return {
    success: true,
    deleted: result.count,
  };
}

export async function clearDatabaseAction() {
  const deletionOrder = [
    { model: "VoucherItem", deleteMany: () => db.voucherItem.deleteMany() },
    { model: "LedgerEntry", deleteMany: () => db.ledgerEntry.deleteMany() },
    { model: "StockMove", deleteMany: () => db.stockMove.deleteMany() },
    { model: "Voucher", deleteMany: () => db.voucher.deleteMany() },
    { model: "Item", deleteMany: () => db.item.deleteMany() },
    { model: "Ledger", deleteMany: () => db.ledger.deleteMany() },
  ];

  const deletedCounts: Array<{ model: string; count: number }> = [];

  for (const entry of deletionOrder) {
    const result = await entry.deleteMany();
    deletedCounts.push({
      model: entry.model,
      count: result.count,
    });
  }

  revalidatePath("/");
  revalidatePath("/inventory/items");
  revalidatePath("/ledger");
  revalidatePath("/reports");
  revalidatePath("/vouchers/sales");
  revalidatePath("/vouchers/purchase");
  revalidatePath("/vouchers/payment");
  revalidatePath("/vouchers/receipt");

  return {
    success: true,
    deletedCounts,
  };
}