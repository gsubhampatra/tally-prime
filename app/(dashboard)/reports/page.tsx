import { db } from "@/lib/db";

export default async function ReportsPage() {
  // Profit summary
  const sales = await db.voucher.aggregate({
    where: { type: "SALE" },
    _sum: { totalAmount: true },
  });
  const purchases = await db.voucher.aggregate({
    where: { type: "PURCHASE" },
    _sum: { totalAmount: true },
  });
  const grossProfit = (sales._sum.totalAmount || 0) - (purchases._sum.totalAmount || 0);

  // Stock summary
  const stockMoves = await db.stockMove.groupBy({
    by: ["itemId", "type"],
    _sum: { quantity: true },
  });

  const stockMap = new Map<string, number>();
  for (const move of stockMoves) {
    const current = stockMap.get(move.itemId) || 0;
    if (move.type === "IN") {
      stockMap.set(move.itemId, current + (move._sum.quantity || 0));
    } else {
      stockMap.set(move.itemId, current - (move._sum.quantity || 0));
    }
  }

  const items = await db.item.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">Business insights &amp; summaries</p>
      </div>

      {/* Profit & Loss */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Profit &amp; Loss Summary</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 p-6">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">₹{(sales._sum.totalAmount || 0).toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Purchases</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">₹{(purchases._sum.totalAmount || 0).toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Gross Profit</p>
            <p className={`text-2xl font-bold mt-1 ${grossProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ₹{Math.abs(grossProfit).toLocaleString("en-IN")}
              {grossProfit < 0 && <span className="text-sm font-normal ml-1">(Loss)</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Stock Summary */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Stock Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Item</th>
                <th className="px-6 py-3 text-left font-medium">Unit</th>
                <th className="px-6 py-3 text-right font-medium">Current Stock</th>
                <th className="px-6 py-3 text-right font-medium">Value (Base)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const stock = stockMap.get(item.id) || 0;
                return (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 font-medium">{item.name}</td>
                    <td className="px-6 py-3">{item.unit}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        stock <= 0 ? "bg-red-100 text-red-800" :
                        stock < 10 ? "bg-amber-100 text-amber-800" :
                        "bg-emerald-100 text-emerald-800"
                      }`}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">₹{(stock * item.basePrice).toLocaleString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
