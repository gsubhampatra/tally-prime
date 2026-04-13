"use server";

import { db } from "@/lib/db";

export async function getDashboardStatsAction() {
  // Total Sales
  const salesTotal = await db.voucher.aggregate({
    where: { type: "SALE" },
    _sum: { totalAmount: true },
    _count: true,
  });

  // Total Purchases
  const purchaseTotal = await db.voucher.aggregate({
    where: { type: "PURCHASE" },
    _sum: { totalAmount: true },
    _count: true,
  });

  // Outstanding Receivables (Customer balances > 0)
  const customerEntries = await db.ledgerEntry.groupBy({
    by: ["ledgerId"],
    _sum: { debit: true, credit: true },
  });

  // Get ledger types for filtering
  const ledgers = await db.ledger.findMany({
    select: { id: true, type: true },
  });
  const ledgerTypeMap = new Map(ledgers.map((l) => [l.id, l.type]));

  let totalReceivables = 0;
  let totalPayables = 0;

  for (const entry of customerEntries) {
    const balance = (entry._sum.debit || 0) - (entry._sum.credit || 0);
    const type = ledgerTypeMap.get(entry.ledgerId);
    if (type === "CUSTOMER" && balance > 0) totalReceivables += balance;
    if (type === "SUPPLIER" && balance < 0) totalPayables += Math.abs(balance);
  }

  // Low Stock Items (derived stock < 10)
  const stockMoves = await db.stockMove.groupBy({
    by: ["itemId", "type"],
    _sum: { quantity: true },
  });

  const stockMap = new Map<string, number>();
  for (const move of stockMoves) {
    const current = stockMap.get(move.itemId) || 0;
    if (move.type === "IN") {
      stockMap.set(move.itemId, current + (move._sum.quantity || 0));
    } else {
      stockMap.set(move.itemId, current - (move._sum.quantity || 0));
    }
  }
  const lowStockCount = Array.from(stockMap.values()).filter((v) => v < 10).length;

  // Recent Vouchers
  const recentVouchers = await db.voucher.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { ledger: { select: { name: true } } },
  });

  return {
    totalSales: salesTotal._sum.totalAmount || 0,
    salesCount: salesTotal._count,
    totalPurchases: purchaseTotal._sum.totalAmount || 0,
    purchaseCount: purchaseTotal._count,
    totalReceivables,
    totalPayables,
    lowStockCount,
    recentVouchers,
  };
}
