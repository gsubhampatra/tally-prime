import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.lte = toDate;
  }

  const vouchers = await db.voucher.findMany({
    where: {
      type: "PURCHASE",
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
    },
    orderBy: { date: "desc" },
    include: {
      ledger: { select: { name: true } },
      items: {
        include: {
          item: { select: { name: true, unit: true } },
        },
      },
    },
  });

  // Flatten vouchers into rows: one row per item, with voucher details repeated
  const rows: Record<string, string | number>[] = [];

  for (const v of vouchers) {
    if (v.items.length === 0) {
      // Voucher with no items (shouldn't happen for purchase, but be safe)
      rows.push({
        Date: new Date(v.date).toLocaleDateString("en-IN"),
        Supplier: v.ledger.name,
        Note: v.note || "",
        Item: "",
        Qty: "",
        Unit: "",
        Rate: "",
        Amount: "",
        "Voucher Total": v.totalAmount,
      });
    } else {
      for (let i = 0; i < v.items.length; i++) {
        const item = v.items[i];
        rows.push({
          Date: i === 0 ? new Date(v.date).toLocaleDateString("en-IN") : "",
          Supplier: i === 0 ? v.ledger.name : "",
          Note: i === 0 ? (v.note || "") : "",
          Item: item.item.name,
          Qty: item.quantity,
          Unit: item.item.unit,
          Rate: item.price,
          Amount: item.total,
          "Voucher Total": i === 0 ? v.totalAmount : "",
        });
      }
    }
  }

  // Add grand total row
  const grandTotal = vouchers.reduce((s, v) => s + v.totalAmount, 0);
  rows.push({
    Date: "",
    Supplier: "",
    Note: "",
    Item: "",
    Qty: "",
    Unit: "",
    Rate: "",
    Amount: "",
    "Voucher Total": "",
  });
  rows.push({
    Date: "",
    Supplier: "",
    Note: "",
    Item: "",
    Qty: "",
    Unit: "",
    Rate: "Grand Total",
    Amount: "",
    "Voucher Total": grandTotal,
  });

  // Build workbook
  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws["!cols"] = [
    { wch: 14 }, // Date
    { wch: 22 }, // Supplier
    { wch: 20 }, // Note
    { wch: 22 }, // Item
    { wch: 8 },  // Qty
    { wch: 8 },  // Unit
    { wch: 12 }, // Rate
    { wch: 14 }, // Amount
    { wch: 16 }, // Voucher Total
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Purchases");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="purchases_${from || "all"}_to_${to || "all"}.xlsx"`,
    },
  });
}
