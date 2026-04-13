import VoucherForm from "@/components/vouchers/VoucherForm";
import { db } from "@/lib/db";

export default async function NewPurchaseVoucherPage() {
  const ledgers = await db.ledger.findMany({
    where: { type: "SUPPLIER" },
    select: { id: true, name: true },
  });

  const items = await db.item.findMany({
    select: { id: true, name: true, sellingPrice: true, basePrice: true },
  });

  return (
    <div className="space-y-6">
      <VoucherForm
        type="PURCHASE"
        ledgers={ledgers}
        items={items}
      />
    </div>
  );
}
