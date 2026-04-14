"use server";

import { db } from "@/lib/db";
import { z } from "zod";

const ItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  sellingPrice: z.number().nonnegative(),
  basePrice: z.number().nonnegative(),
});

export type ItemInput = z.infer<typeof ItemSchema>;

export async function createItemAction(data: ItemInput) {
  try {
    const parsed = ItemSchema.parse(data);
    const item = await db.item.create({ data: parsed });
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Item Creation Error:", error);
    return { success: false, error: error.message || "Failed to create item" };
  }
}

export async function updateItemAction(itemId: string, data: ItemInput) {
  try {
    const parsed = ItemSchema.parse(data);
    const item = await db.item.update({
      where: { id: itemId },
      data: parsed,
    });
    return { success: true, data: item };
  } catch (error: any) {
    console.error("Item Update Error:", error);
    return { success: false, error: error.message || "Failed to update item" };
  }
}

export async function getItemsAction() {
  return db.item.findMany({ orderBy: { name: "asc" } });
}

export async function getItemAction(itemId: string) {
  return db.item.findUnique({ where: { id: itemId } });
}

export async function getItemWithStockAction(itemId: string) {
  const item = await db.item.findUnique({
    where: { id: itemId },
    include: {
      stockMoves: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!item) return null;

  const totals = await db.stockMove.groupBy({
    by: ["type"],
    where: { itemId },
    _sum: { quantity: true },
  });

  const inQty = totals.find((t) => t.type === "IN")?._sum.quantity || 0;
  const outQty = totals.find((t) => t.type === "OUT")?._sum.quantity || 0;
  const stock = inQty - outQty;

  return { ...item, stock };
}
