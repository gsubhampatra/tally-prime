import Link from "next/link";
import { db } from "@/lib/db";

export default async function ItemsPage() {
  const items = await db.item.findMany({ orderBy: { name: "asc" } });
  type ItemRow = (typeof items)[number];

  // Get derived stock for each item
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Items</h1>
          <p className="text-muted-foreground mt-1">Manage your stock items</p>
        </div>
        <Link href="/inventory/items/new">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            + Add Item
          </button>
        </Link>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Name</th>
                <th className="px-6 py-3 text-left font-medium">Category</th>
                <th className="px-6 py-3 text-left font-medium">Unit</th>
                <th className="px-6 py-3 text-right font-medium">Base Price</th>
                <th className="px-6 py-3 text-right font-medium">Selling Price</th>
                <th className="px-6 py-3 text-right font-medium">Stock</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No items yet. Add your first inventory item.
                  </td>
                </tr>
              ) : (
                items.map((item: ItemRow) => {
                  const stock = stockMap.get(item.id) || 0;
                  return (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3 font-medium">{item.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{item.category || "—"}</td>
                      <td className="px-6 py-3">{item.unit}</td>
                      <td className="px-6 py-3 text-right">₹{item.basePrice.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-3 text-right">₹{item.sellingPrice.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-3 text-right">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          stock <= 0 ? "bg-red-100 text-red-800" :
                          stock < 10 ? "bg-amber-100 text-amber-800" :
                          "bg-emerald-100 text-emerald-800"
                        }`}>
                          {stock} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link href={`/inventory/items/${item.id}/edit`} className="text-primary hover:underline text-sm font-medium">
                          Edit
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
