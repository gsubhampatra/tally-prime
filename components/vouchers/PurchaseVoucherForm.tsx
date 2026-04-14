"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SearchableSelect from "@/components/ui/searchable-select";
import { createVoucherAction } from "@/server/actions/voucher.actions";
import { VoucherInput, VoucherSchema } from "@/server/validators/voucher.schema";

export type PurchaseItemOption = {
  id: string;
  name: string;
  unit: string;
  sellingPrice: number;
  basePrice: number;
};

type PurchaseVoucherLine = {
  rowId: string;
  itemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
};

type PurchaseVoucherFormProps = {
  ledgers: { id: string; name: string }[];
  items?: PurchaseItemOption[];
  initialValues?: Omit<Partial<VoucherInput>, "date"> & { date?: string | Date };
  submitAction?: (data: VoucherInput) => Promise<{ success: boolean; error?: string }>;
  submitLabel?: string;
  successPath?: string;
};

function toDateInputValue(dateValue?: string | Date) {
  if (!dateValue) return new Date().toISOString().slice(0, 10);
  const date = new Date(dateValue);
  return date.toISOString().slice(0, 10);
}

function createRowId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function PurchaseVoucherForm({
  ledgers,
  items = [],
  initialValues,
  submitAction = createVoucherAction,
  submitLabel,
  successPath,
}: PurchaseVoucherFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<PurchaseVoucherLine[]>(() => {
    return (initialValues?.items || []).map((item) => {
      const matchedItem = items.find((option) => option.id === item.itemId);
      return {
        rowId: createRowId(),
        itemId: item.itemId,
        itemName: matchedItem?.name || item.itemId,
        unit: matchedItem?.unit || "",
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      };
    });
  });

  const [draft, setDraft] = useState({
    itemId: "",
    itemName: "",
    unit: "",
    quantity: 1,
    price: 0,
    total: 0,
  });

  const form = useForm<VoucherInput>({
    resolver: zodResolver(VoucherSchema) as any,
    defaultValues: {
      type: "PURCHASE",
      date: new Date(toDateInputValue(initialValues?.date)),
      ledgerId: initialValues?.ledgerId || "",
      offsetLedgerId: initialValues?.offsetLedgerId || "",
      totalAmount: initialValues?.totalAmount || 0,
      items: [],
      note: initialValues?.note || "",
    },
  });

  const ledgerOptions = useMemo(
    () => ledgers.map((ledger) => ({ value: ledger.id, label: ledger.name })),
    [ledgers]
  );

  const itemOptions = useMemo(
    () => items.map((item) => ({ value: item.id, label: item.name, description: `Base ₹${item.basePrice.toLocaleString("en-IN")}` })),
    [items]
  );

  const totalAmount = useMemo(() => lineItems.reduce((sum, item) => sum + item.total, 0), [lineItems]);

  useEffect(() => {
    form.setValue("totalAmount", totalAmount, { shouldValidate: true });
  }, [form, totalAmount]);

  const resetDraft = () => {
    setDraft({
      itemId: "",
      itemName: "",
      unit: "",
      quantity: 1,
      price: 0,
      total: 0,
    });
    setEditingRowId(null);
  };

  const populateDraftFromItem = (itemId: string) => {
    const item = items.find((option) => option.id === itemId);
    if (!item) return;

    const quantity = draft.quantity || 1;
    const price = item.basePrice;
    setDraft({
      itemId: item.id,
      itemName: item.name,
      unit: item.unit,
      quantity,
      price,
      total: quantity * price,
    });
  };

  const commitDraft = () => {
    if (!draft.itemId) {
      alert("Please select an item.");
      return;
    }

    if (draft.quantity <= 0) {
      alert("Quantity must be greater than zero.");
      return;
    }

    const currentItem = items.find((item) => item.id === draft.itemId);
    if (!currentItem) {
      alert("Selected item is no longer available.");
      return;
    }

    const row: PurchaseVoucherLine = {
      rowId: editingRowId || createRowId(),
      itemId: currentItem.id,
      itemName: currentItem.name,
      unit: currentItem.unit,
      quantity: draft.quantity,
      price: draft.price,
      total: draft.quantity * draft.price,
    };

    setLineItems((current) => {
      if (editingRowId) {
        return current.map((entry) => (entry.rowId === editingRowId ? row : entry));
      }
      return [...current, row];
    });

    resetDraft();
  };

  const handleDraftKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft();
    }
  };

  const handleEditRow = (row: PurchaseVoucherLine) => {
    setDraft({
      itemId: row.itemId,
      itemName: row.itemName,
      unit: row.unit,
      quantity: row.quantity,
      price: row.price,
      total: row.total,
    });
    setEditingRowId(row.rowId);
  };

  const handleDeleteRow = (rowId: string) => {
    setLineItems((current) => current.filter((entry) => entry.rowId !== rowId));
    if (editingRowId === rowId) {
      resetDraft();
    }
  };

  const onSubmit = async (data: VoucherInput) => {
    if (lineItems.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: VoucherInput = {
        ...data,
        type: "PURCHASE",
        totalAmount,
        items: lineItems.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      };

      const res = await submitAction(payload);
      if (res.success) {
        alert(submitLabel ? `${submitLabel} Successfully!` : "Purchase Voucher Saved Successfully!");
        router.push(successPath || "/vouchers/purchase");
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-5xl">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">PURCHASE VOUCHER</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...form.register("date")} />
              {form.formState.errors.date && <p className="text-red-500 text-sm">{form.formState.errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Supplier</Label>
              <SearchableSelect
                value={form.watch("ledgerId")}
                onChange={(value) => form.setValue("ledgerId", value, { shouldValidate: true })}
                options={ledgerOptions}
                placeholder="Search supplier..."
              />
              {form.formState.errors.ledgerId && <p className="text-red-500 text-sm">{form.formState.errors.ledgerId.message}</p>}
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold text-sm md:text-base">Item Entry</h3>
                <p className="text-xs text-muted-foreground">Press Enter in Qty or Price to add or update the row.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={commitDraft}>
                {editingRowId ? "Update Item" : "Add Item"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-3">
              <div className="space-y-2 md:col-span-1">
                <Label className="text-xs text-muted-foreground">Item</Label>
                <SearchableSelect
                  value={draft.itemId}
                  onChange={(value) => {
                    const item = items.find((entry) => entry.id === value);
                    if (!item) return;
                    const quantity = draft.quantity || 1;
                    const price = item.basePrice;
                    setDraft({
                      itemId: item.id,
                      itemName: item.name,
                      unit: item.unit,
                      quantity,
                      price,
                      total: quantity * price,
                    });
                  }}
                  options={itemOptions}
                  placeholder="Search item..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Qty</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.quantity}
                  onChange={(event) => {
                    const quantity = parseFloat(event.target.value) || 0;
                    setDraft((current) => ({ ...current, quantity, total: quantity * current.price }));
                  }}
                  onKeyDown={handleDraftKeyDown}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.price}
                  onChange={(event) => {
                    const price = parseFloat(event.target.value) || 0;
                    setDraft((current) => ({ ...current, price, total: current.quantity * price }));
                  }}
                  onKeyDown={handleDraftKeyDown}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Total</Label>
                <Input type="number" step="0.01" value={draft.total} readOnly />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {editingRowId && (
                <Button type="button" variant="outline" size="sm" onClick={resetDraft}>
                  Cancel Edit
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" onClick={() => resetDraft()}>
                Clear
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold text-sm md:text-base">Added Items</h3>
            </div>
            {lineItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No items added yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="px-4 py-3 text-left font-medium">Item</th>
                      <th className="px-4 py-3 text-left font-medium">Unit</th>
                      <th className="px-4 py-3 text-right font-medium">Qty</th>
                      <th className="px-4 py-3 text-right font-medium">Price</th>
                      <th className="px-4 py-3 text-right font-medium">Total</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((row) => (
                      <tr key={row.rowId} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="px-4 py-3">
                          <div className="font-medium">{row.itemName}</div>
                        </td>
                        <td className="px-4 py-3">{row.unit}</td>
                        <td className="px-4 py-3 text-right">{row.quantity}</td>
                        <td className="px-4 py-3 text-right">₹{row.price.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right font-semibold">₹{row.total.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => handleEditRow(row)}>
                              Edit
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteRow(row.rowId)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>Narration / Note</Label>
              <Input {...form.register("note")} placeholder="Enter transaction note..." />
            </div>
            <div className="space-y-2">
              <Label>Grand Total</Label>
              <Input type="number" step="0.01" {...form.register("totalAmount", { valueAsNumber: true })} readOnly />
              {form.formState.errors.totalAmount && <p className="text-red-500 text-sm">{form.formState.errors.totalAmount.message}</p>}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : submitLabel || "Save Purchase Voucher"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
