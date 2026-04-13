import Link from "next/link";
import { db } from "@/lib/db";
import PurchaseTable from "./PurchaseTable";

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function PurchasePage({ searchParams }: Props) {
  const { from, to } = await searchParams;

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.lte = toDate;
  }

  const vouchers = await db.voucher.findMany({
    where: {
      type: "PURCHASE",
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
    },
    orderBy: { date: "desc" },
    include: {
      ledger: { select: { name: true } },
      items: {
        include: {
          item: { select: { name: true, unit: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Vouchers</h1>
          <p className="text-muted-foreground mt-1">All recorded purchase transactions</p>
        </div>
        <Link href="/vouchers/purchase/new">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            + New Purchase
          </button>
        </Link>
      </div>

      <PurchaseTable
        vouchers={JSON.parse(JSON.stringify(vouchers))}
        initialFrom={from || ""}
        initialTo={to || ""}
      />
    </div>
  );
}
