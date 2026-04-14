import { getDashboardStatsAction } from "@/server/actions/dashboard.actions";
import Link from "next/link";
import DatabaseMaintenance from "@/components/admin/DatabaseMaintenance";

export default async function DashboardPage() {
  const stats = await getDashboardStatsAction();

  const kpis = [
    { label: "Total Sales", value: `₹${stats.totalSales.toLocaleString("en-IN")}`, sub: `${stats.salesCount} vouchers`, color: "from-emerald-500 to-teal-600" },
    { label: "Total Purchases", value: `₹${stats.totalPurchases.toLocaleString("en-IN")}`, sub: `${stats.purchaseCount} vouchers`, color: "from-blue-500 to-indigo-600" },
    { label: "Outstanding Receivables", value: `₹${stats.totalReceivables.toLocaleString("en-IN")}`, sub: "from customers", color: "from-amber-500 to-orange-600" },
    { label: "Outstanding Payables", value: `₹${stats.totalPayables.toLocaleString("en-IN")}`, sub: "to suppliers", color: "from-rose-500 to-pink-600" },
    { label: "Low Stock Items", value: stats.lowStockCount.toString(), sub: "below threshold", color: "from-violet-500 to-purple-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your business at a glance</p>
        </div>
        <div className="flex gap-3">
          <Link href="/vouchers/sales/new">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
              + New Sale
            </button>
          </Link>
          <Link href="/vouchers/purchase/new">
            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-accent transition-colors">
              + New Purchase
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
            <div className={`absolute inset-0 opacity-[0.03] bg-linear-to-br ${kpi.color}`} />
            <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{kpi.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <DatabaseMaintenance />

      {/* Recent Vouchers */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Type</th>
                <th className="px-6 py-3 text-left font-medium">Party</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentVouchers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No transactions yet. Create your first voucher to get started.
                  </td>
                </tr>
              ) : (
                stats.recentVouchers.map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        v.type === "SALE" ? "bg-emerald-100 text-emerald-800" :
                        v.type === "PURCHASE" ? "bg-blue-100 text-blue-800" :
                        v.type === "PAYMENT" ? "bg-rose-100 text-rose-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {v.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium">{v.ledger.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{new Date(v.date).toLocaleDateString("en-IN")}</td>
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
