import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function LedgerDetailPage({ params }: { params: Promise<{ ledgerId: string }> }) {
  const { ledgerId } = await params;

  const ledger = await db.ledger.findUnique({
    where: { id: ledgerId },
    include: {
      entries: { orderBy: { date: "desc" } },
    },
  });

  if (!ledger) return notFound();

  type LedgerEntryRow = (typeof ledger.entries)[number];

  // Calculate running balance
  let runningBalance = 0;
  const entriesWithBalance = [...ledger.entries].reverse().map((entry: LedgerEntryRow) => {
    runningBalance += entry.debit - entry.credit;
    return { ...entry, runningBalance };
  }).reverse();

  const totalDebit = ledger.entries.reduce((s: number, e: LedgerEntryRow) => s + e.debit, 0);
  const totalCredit = ledger.entries.reduce((s: number, e: LedgerEntryRow) => s + e.credit, 0);
  const closingBalance = totalDebit - totalCredit;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{ledger.name}</h1>
          <p className="text-muted-foreground mt-1">
            {ledger.type} Ledger • {ledger.phone || "No phone"}
          </p>
        </div>
        <Link href={`/ledger/${ledger.id}/edit`} className="text-primary hover:underline text-sm font-medium pt-2">
          Edit Ledger
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Debit</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalDebit.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Credit</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">₹{totalCredit.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Closing Balance</p>
          <p className="text-2xl font-bold mt-1">
            ₹{Math.abs(closingBalance).toLocaleString("en-IN")}
            <span className="text-sm font-normal ml-1">{closingBalance > 0 ? "Dr" : closingBalance < 0 ? "Cr" : ""}</span>
          </p>
        </div>
      </div>

      {/* Ledger Statement */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Ledger Statement</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Ref Type</th>
                <th className="px-6 py-3 text-right font-medium">Debit</th>
                <th className="px-6 py-3 text-right font-medium">Credit</th>
                <th className="px-6 py-3 text-right font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {entriesWithBalance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No entries yet.
                  </td>
                </tr>
              ) : (
                entriesWithBalance.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3">{new Date(entry.date).toLocaleDateString("en-IN")}</td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">{entry.refType}</span>
                    </td>
                    <td className="px-6 py-3 text-right">{entry.debit > 0 ? `₹${entry.debit.toLocaleString("en-IN")}` : "—"}</td>
                    <td className="px-6 py-3 text-right">{entry.credit > 0 ? `₹${entry.credit.toLocaleString("en-IN")}` : "—"}</td>
                    <td className="px-6 py-3 text-right font-medium">
                      ₹{Math.abs(entry.runningBalance).toLocaleString("en-IN")}
                      <span className="text-xs ml-1">{entry.runningBalance > 0 ? "Dr" : entry.runningBalance < 0 ? "Cr" : ""}</span>
                    </td>
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
