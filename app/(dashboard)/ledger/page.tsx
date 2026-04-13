import Link from "next/link";
import { db } from "@/lib/db";

export default async function LedgersPage() {
  const ledgers = await db.ledger.findMany({ orderBy: { name: "asc" } });

  // Get balances for all ledgers
  const entries = await db.ledgerEntry.groupBy({
    by: ["ledgerId"],
    _sum: { debit: true, credit: true },
  });
  const balanceMap = new Map(
    entries.map((e) => [e.ledgerId, (e._sum.debit || 0) - (e._sum.credit || 0)])
  );

  const typeColors: Record<string, string> = {
    CUSTOMER: "bg-emerald-100 text-emerald-800",
    SUPPLIER: "bg-blue-100 text-blue-800",
    CASH: "bg-amber-100 text-amber-800",
    BANK: "bg-violet-100 text-violet-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledgers</h1>
          <p className="text-muted-foreground mt-1">Manage your accounting ledgers</p>
        </div>
        <Link href="/ledger/new">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            + New Ledger
          </button>
        </Link>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Name</th>
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-left font-medium">Phone</th>
                <th className="px-6 py-3 text-right font-medium">Balance</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No ledgers yet. Create your first ledger.
                  </td>
                </tr>
              ) : (
                ledgers.map((ledger) => {
                  const balance = balanceMap.get(ledger.id) || 0;
                  return (
                    <tr key={ledger.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3 font-medium">{ledger.name}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[ledger.type]}`}>
                          {ledger.type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{ledger.phone || "—"}</td>
                      <td className="px-6 py-3 text-right font-semibold">
                        <span className={balance > 0 ? "text-emerald-600" : balance < 0 ? "text-rose-600" : ""}>
                          ₹{Math.abs(balance).toLocaleString("en-IN")}
                          {balance > 0 ? " Dr" : balance < 0 ? " Cr" : ""}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link href={`/ledger/${ledger.id}`} className="text-primary hover:underline text-sm font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
