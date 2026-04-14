"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { clearDatabaseAction, loadSeedDataAction, resetStockAction } from "@/server/actions/database.actions";

export default function DatabaseManager() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("No action has been run yet.");

  const run = async (
    confirmText: string,
    action: () => Promise<{ success: boolean; [key: string]: unknown }>,
    onSuccess: (result: { success: boolean; [key: string]: unknown }) => string,
  ) => {
    if (!window.confirm(confirmText)) return;

    setMessage("Processing...");
    startTransition(async () => {
      const result = await action();
      setMessage(result.success ? onSuccess(result) : "Action failed.");
    });
  };

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Database Manager</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Load seed items, reset stock, or clear the database model by model.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            run(
              "Load seed data? Existing items will be skipped.",
              loadSeedDataAction,
              (result) => `Seed data loaded. Created ${(result.created as number) || 0} items and skipped ${(result.skipped as number) || 0}.`,
            )
          }
        >
          Load Seed Data
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            run(
              "Reset stock? This deletes all stock movement records.",
              resetStockAction,
              (result) => `Stock reset completed. Deleted ${(result.deleted as number) || 0} stock movements.`,
            )
          }
        >
          Reset Stock
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          onClick={() =>
            run(
              "Clear the database? This will delete vouchers, items, ledgers, entries, and stock records.",
              clearDatabaseAction,
              (result) => {
                const total = Array.isArray(result.deletedCounts) ? (result.deletedCounts as Array<{ count: number }>).reduce((sum, entry) => sum + entry.count, 0) : 0;
                return `Database cleared. Deleted ${total} records.`;
              },
            )
          }
        >
          Clear Database
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{message}</p>
    </section>
  );
}
