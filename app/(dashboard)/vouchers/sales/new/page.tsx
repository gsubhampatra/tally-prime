import VoucherForm from "@/components/vouchers/VoucherForm";
import { db } from "@/lib/db";

export default async function NewSaleVoucherPage() {
  // Fetch Customers for Sales
  const ledgers = await db.ledger.findMany({
    where: { type: "CUSTOMER" },
    select: { id: true, name: true, type: true }
  });
  
  // Sales defaults to potentially Cash or Bank if it's a cash sale, or nothing if credit.
  const offsetLedgers = await db.ledger.findMany({
    where: { type: { in: ["CASH", "BANK"] } },
    select: { id: true, name: true, type: true }
  });

  // Fetch Items
  const items = await db.item.findMany({
    select: { id: true, name: true, sellingPrice: true, basePrice: true }
  });

  return (
    <div className="space-y-6">
      <VoucherForm 
        type="SALE" 
        ledgers={ledgers} 
        offsetLedgers={offsetLedgers} 
        items={items} 
      />
    </div>
  );
}
