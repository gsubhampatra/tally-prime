import { notFound } from "next/navigation";
import PurchaseVoucherForm from "@/components/vouchers/PurchaseVoucherForm";
import { db } from "@/lib/db";
import { updatePurchaseVoucherAction } from "@/server/actions/voucher.actions";

export default async function EditPurchaseVoucherPage({ params }: { params: Promise<{ voucherId: string }> }) {
  const { voucherId } = await params;

  const voucher = await db.voucher.findUnique({
    where: { id: voucherId },
    include: {
      ledger: { select: { id: true, name: true } },
      items: {
        include: {
          item: { select: { id: true, name: true, unit: true, sellingPrice: true, basePrice: true } },
        },
      },
    },
  });

  if (!voucher || voucher.type !== "PURCHASE") return notFound();

  const ledgers = await db.ledger.findMany({
    where: { type: "SUPPLIER" },
    select: { id: true, name: true },
  });

  const items = await db.item.findMany({
    select: { id: true, name: true, unit: true, sellingPrice: true, basePrice: true },
  });

  return (
    <div className="space-y-6">
      <PurchaseVoucherForm
        ledgers={ledgers}
        items={items}
        initialValues={{
          date: voucher.date,
          ledgerId: voucher.ledgerId,
          totalAmount: voucher.totalAmount,
          note: voucher.note || "",
          items: voucher.items.map((entry) => ({
            itemId: entry.itemId,
            quantity: entry.quantity,
            price: entry.price,
            total: entry.total,
          })),
        }}
        submitAction={(data) => updatePurchaseVoucherAction(voucherId, data)}
        submitLabel="Update Purchase"
        successPath="/vouchers/purchase"
      />
    </div>
  );
}
