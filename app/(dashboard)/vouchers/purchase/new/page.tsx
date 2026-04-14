import PurchaseVoucherForm from "@/components/vouchers/PurchaseVoucherForm";
import { db } from "@/lib/db";

export default async function NewPurchaseVoucherPage() {
  const ledgers = await db.ledger.findMany({
    where: { type: "SUPPLIER" },
    select: { id: true, name: true },
  });

  const items = await db.item.findMany({
    select: { id: true, name: true, unit: true, sellingPrice: true, basePrice: true },
  });

  return (
    <div className="space-y-6">
      <PurchaseVoucherForm ledgers={ledgers} items={items} />
    </div>
  );
}
