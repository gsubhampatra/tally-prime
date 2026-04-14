"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PurchaseVoucherActions from "@/components/vouchers/PurchaseVoucherActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VoucherWithItems = {
  id: string;
  date: string;
  totalAmount: number;
  note: string | null;
  ledger: { name: string };
  items: {
    id: string;
    quantity: number;
    price: number;
    total: number;
    item: { name: string; unit: string };
  }[];
};

type Props = {
  vouchers: VoucherWithItems[];
  initialFrom: string;
  initialTo: string;
};

export default function PurchaseTable({ vouchers, initialFrom, initialTo }: Props) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [downloading, setDownloading] = useState(false);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/vouchers/purchase?${params.toString()}`);
  };

  const clearFilter = () => {
    setFrom("");
    setTo("");
    router.push("/vouchers/purchase");
  };

  const downloadExcel = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const res = await fetch(`/api/reports/purchase-excel?${params.toString()}`);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `purchases_${from || "all"}_to_${to || "all"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download Excel file");
    } finally {
      setDownloading(false);
    }
  };

  const grandTotal = vouchers.reduce((sum, v) => sum + v.totalAmount, 0);

  return (
    <div className="space-y-4">
      {/* Date Filter Bar */}
      <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From Date</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">To Date</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={applyFilter} size="sm">Apply Filter</Button>
          {(from || to) && (
            <Button onClick={clearFilter} variant="outline" size="sm">Clear</Button>
          )}
          <Button onClick={downloadExcel} variant="outline" size="sm" disabled={downloading} className="ml-auto">
            {downloading ? "Generating..." : "⬇ Download Excel"}
          </Button>
        </div>
      </div>

      {/* Summary */}
      {vouchers.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
          <span>{vouchers.length} voucher{vouchers.length !== 1 ? "s" : ""}</span>
          <span className="font-semibold text-foreground">Total: ₹{grandTotal.toLocaleString("en-IN")}</span>
        </div>
      )}

      {/* Mobile card layout + Desktop table */}
      {vouchers.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
          No purchases found for the selected date range.
        </div>
      ) : (
        <>
          {/* Desktop Table — hidden on mobile */}
          <div className="hidden md:block rounded-xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th className="px-6 py-3 text-left font-medium w-8"></th>
                    <th className="px-6 py-3 text-left font-medium">Date</th>
                    <th className="px-6 py-3 text-left font-medium">Supplier</th>
                    <th className="px-6 py-3 text-left font-medium">Items</th>
                    <th className="px-6 py-3 text-left font-medium">Note</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                {vouchers.map((v) => {
                  const isExpanded = expandedId === v.id;
                  return (
                    <tbody key={v.id}>
                      <tr
                        onClick={() => toggle(v.id)}
                        className={`border-b cursor-pointer transition-colors ${isExpanded ? "bg-muted/70" : "hover:bg-muted/50"}`}
                      >
                        <td className="px-6 py-3 text-muted-foreground">
                          <span className="inline-block transition-transform duration-200" style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                        </td>
                        <td className="px-6 py-3">{new Date(v.date).toLocaleDateString("en-IN")}</td>
                        <td className="px-6 py-3 font-medium">{v.ledger.name}</td>
                        <td className="px-6 py-3 text-muted-foreground">{v.items.length} item{v.items.length !== 1 ? "s" : ""}</td>
                        <td className="px-6 py-3 text-muted-foreground">{v.note || "—"}</td>
                        <td className="px-6 py-3 text-right font-semibold">₹{v.totalAmount.toLocaleString("en-IN")}</td>
                        <td className="px-6 py-3 text-right">
                          <div onClick={(e) => e.stopPropagation()}>
                            <PurchaseVoucherActions voucherId={v.id} />
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="bg-muted/30 px-0 py-0">
                            <div className="px-12 py-4">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-xs text-muted-foreground uppercase tracking-wider">
                                    <th className="pb-2 text-left font-medium">Item</th>
                                    <th className="pb-2 text-right font-medium">Qty</th>
                                    <th className="pb-2 text-left font-medium">Unit</th>
                                    <th className="pb-2 text-right font-medium">Rate</th>
                                    <th className="pb-2 text-right font-medium">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {v.items.map((item) => (
                                    <tr key={item.id} className="border-t border-dashed border-border/50">
                                      <td className="py-2 font-medium">{item.item.name}</td>
                                      <td className="py-2 text-right">{item.quantity}</td>
                                      <td className="py-2 text-left pl-2 text-muted-foreground">{item.item.unit}</td>
                                      <td className="py-2 text-right">₹{item.price.toLocaleString("en-IN")}</td>
                                      <td className="py-2 text-right font-semibold">₹{item.total.toLocaleString("en-IN")}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t font-semibold">
                                    <td colSpan={4} className="pt-2 text-right">Total</td>
                                    <td className="pt-2 text-right">₹{v.totalAmount.toLocaleString("en-IN")}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })}
              </table>
            </div>
          </div>

          {/* Mobile Cards — shown only on mobile */}
          <div className="md:hidden space-y-3">
            {vouchers.map((v) => {
              const isExpanded = expandedId === v.id;
              return (
                <div key={v.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  {/* Card header */}
                  <div
                    onClick={() => toggle(v.id)}
                    className={`p-4 cursor-pointer transition-colors ${isExpanded ? "bg-muted/50" : "active:bg-muted/30"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{v.ledger.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(v.date).toLocaleDateString("en-IN")} • {v.items.length} item{v.items.length !== 1 ? "s" : ""}
                        </p>
                        {v.note && <p className="text-xs text-muted-foreground italic">{v.note}</p>}
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="font-bold text-base">₹{v.totalAmount.toLocaleString("en-IN")}</span>
                        <span
                          className="text-muted-foreground text-xs inline-block transition-transform duration-200"
                          style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                        >
                          ▶
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20 divide-y divide-dashed divide-border/50">
                      {v.items.map((item) => (
                        <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{item.item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} {item.item.unit} × ₹{item.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <span className="font-semibold text-sm">₹{item.total.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div className="px-4 py-3 flex items-center justify-between font-semibold bg-muted/30">
                        <span className="text-sm">Total</span>
                        <div className="flex items-center gap-3">
                          <span>₹{v.totalAmount.toLocaleString("en-IN")}</span>
                          <PurchaseVoucherActions voucherId={v.id} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
