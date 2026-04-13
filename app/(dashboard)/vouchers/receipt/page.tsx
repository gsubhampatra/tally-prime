import Link from "next/link";
import { db } from "@/lib/db";

export default async function ReceiptPage() {
  const vouchers = await db.voucher.findMany({
    where: { type: "RECEIPT" },
    orderBy: { date: "desc" },
    include: { ledger: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipt Vouchers</h1>
          <p className="text-muted-foreground mt-1">All receipts from customers</p>
        </div>
        <Link href="/vouchers/receipt/new">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            + New Receipt
          </button>
        </Link>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Customer</th>
                <th className="px-6 py-3 text-left font-medium">Note</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No receipts yet.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3">{new Date(v.date).toLocaleDateString("en-IN")}</td>
                    <td className="px-6 py-3 font-medium">{v.ledger.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{v.note || "—"}</td>
                    <td className="px-6 py-3 text-right font-semibold">₹{v.totalAmount.toLocaleString("en-IN")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
