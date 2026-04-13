import VoucherForm from "@/components/vouchers/VoucherForm";
import { db } from "@/lib/db";

export default async function NewReceiptVoucherPage() {
  // Receipt: credit customer, debit cash/bank
  const ledgers = await db.ledger.findMany({
    where: { type: "CUSTOMER" },
    select: { id: true, name: true },
  });

  const offsetLedgers = await db.ledger.findMany({
    where: { type: { in: ["CASH", "BANK"] } },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <VoucherForm
        type="RECEIPT"
        ledgers={ledgers}
        offsetLedgers={offsetLedgers}
      />
    </div>
  );
}
