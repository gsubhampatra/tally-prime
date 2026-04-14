"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { clearDatabaseAction, resetStockAction } from "@/server/actions/database.actions";

export default function DatabaseMaintenance() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const runAction = (
    action: () => Promise<{ success: boolean; deleted?: number; deletedCounts?: Array<{ model: string; count: number }> }>,
    confirmText: string,
  ) => {
    if (!window.confirm(confirmText)) return;

    setMessage(null);

    startTransition(async () => {
      const result = await action();

      if (result.success) {
        if (typeof result.deleted === "number") {
          setMessage(`Stock reset completed. Deleted ${result.deleted} stock movement records.`);
        } else if (result.deletedCounts) {
          const totalDeleted = result.deletedCounts.reduce((sum, entry) => sum + entry.count, 0);
          setMessage(`Database cleared. Deleted ${totalDeleted} records across ${result.deletedCounts.length} models.`);
        }
      }
    });
  };

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-amber-950 dark:text-amber-100">Danger Zone</h2>
          <p className="text-sm text-amber-900/80 dark:text-amber-200/80">
            Reset stock by deleting stock movement records, or clear the database model by model.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
            disabled={isPending}
            onClick={() => runAction(resetStockAction, "Reset stock? This will delete all stock movement records.")}
          >
            Reset Stock
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() =>
              runAction(
                clearDatabaseAction,
                "Clear the database? This will delete vouchers, items, ledgers, entries, and stock records one by one."
              )
            }
          >
            Clear Database
          </Button>
        </div>
      </div>

      <p className="mt-3 text-sm text-amber-900/80 dark:text-amber-200/80">
        {isPending ? "Processing..." : message || "No destructive action has been run yet."}
      </p>
    </section>
  );
}