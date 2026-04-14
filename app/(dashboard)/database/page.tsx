import DatabaseManager from "@/components/database/DatabaseManager";
import { db } from "@/lib/db";
import seedItems from "../../../prisma/seed-items.json";

export default async function DatabasePage() {
  const [itemCount, ledgerCount, voucherCount, stockMoveCount] = await Promise.all([
    db.item.count(),
    db.ledger.count(),
    db.voucher.count(),
    db.stockMove.count(),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Database Manager</h1>
        <p className="text-muted-foreground mt-1">Manage seed data and database cleanup tools.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Items</p>
          <p className="text-2xl font-bold mt-1">{itemCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Ledgers</p>
          <p className="text-2xl font-bold mt-1">{ledgerCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Vouchers</p>
          <p className="text-2xl font-bold mt-1">{voucherCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Stock Moves</p>
          <p className="text-2xl font-bold mt-1">{stockMoveCount}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Seed data items available</p>
        <p className="text-2xl font-bold mt-1">{seedItems.length}</p>
      </div>

      <DatabaseManager />
    </div>
  );
}
