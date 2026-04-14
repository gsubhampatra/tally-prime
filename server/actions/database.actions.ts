"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import seedItems from "../../prisma/seed-items.json";

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

export async function loadSeedDataAction() {
  let created = 0;
  let skipped = 0;

  for (const item of seedItems) {
    const existing = await db.item.findFirst({ where: { name: item.name } });

    if (existing) {
      skipped += 1;
      continue;
    }

    await db.item.create({ data: item });
    created += 1;
  }

  revalidatePath("/");
  revalidatePath("/inventory/items");
  revalidatePath("/reports");

  return {
    success: true,
    created,
    skipped,
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

export async function deleteItemAction(itemId: string) {
  const [voucherItemResult, stockMoveResult, itemResult] = await db.$transaction([
    db.voucherItem.deleteMany({ where: { itemId } }),
    db.stockMove.deleteMany({ where: { itemId } }),
    db.item.deleteMany({ where: { id: itemId } }),
  ]);

  revalidatePath("/");
  revalidatePath("/inventory/items");
  revalidatePath("/reports");

  return {
    success: itemResult.count > 0,
    deleted: itemResult.count,
    relatedDeleted: voucherItemResult.count + stockMoveResult.count,
  };
}

export async function deleteLedgerAction(ledgerId: string) {
  const voucherIds = await db.voucher.findMany({
    where: { ledgerId },
    select: { id: true, type: true },
  });

  const voucherIdList = voucherIds.map((voucher) => voucher.id);

  await db.$transaction([
    db.voucherItem.deleteMany({ where: { voucherId: { in: voucherIdList } } }),
    db.stockMove.deleteMany({ where: { refId: { in: voucherIdList } } }),
    db.ledgerEntry.deleteMany({ where: { refId: { in: voucherIdList } } }),
    db.voucher.deleteMany({ where: { ledgerId } }),
    db.ledger.deleteMany({ where: { id: ledgerId } }),
  ]);

  revalidatePath("/");
  revalidatePath("/ledger");
  revalidatePath("/reports");
  revalidatePath("/vouchers/sales");
  revalidatePath("/vouchers/purchase");
  revalidatePath("/vouchers/payment");
  revalidatePath("/vouchers/receipt");

  return { success: true };
}

export async function deletePurchaseVoucherAction(voucherId: string) {
  await db.$transaction([
    db.voucherItem.deleteMany({ where: { voucherId } }),
    db.stockMove.deleteMany({ where: { refId: voucherId, refType: "PURCHASE" } }),
    db.ledgerEntry.deleteMany({ where: { refId: voucherId, refType: "PURCHASE" } }),
    db.voucher.deleteMany({ where: { id: voucherId, type: "PURCHASE" } }),
  ]);

  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath("/vouchers/purchase");

  return { success: true };
}