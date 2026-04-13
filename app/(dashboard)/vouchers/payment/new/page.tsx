import VoucherForm from "@/components/vouchers/VoucherForm";
import { db } from "@/lib/db";

export default async function NewPaymentVoucherPage() {
  // Payment: debit supplier, credit cash/bank
  const ledgers = await db.ledger.findMany({
    where: { type: "SUPPLIER" },
    select: { id: true, name: true },
  });

  const offsetLedgers = await db.ledger.findMany({
    where: { type: { in: ["CASH", "BANK"] } },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <VoucherForm
        type="PAYMENT"
        ledgers={ledgers}
        offsetLedgers={offsetLedgers}
      />
    </div>
  );
}
