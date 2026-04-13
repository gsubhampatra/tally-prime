"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VoucherInput, VoucherSchema } from "@/server/validators/voucher.schema";
import { createVoucherAction } from "@/server/actions/voucher.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type VoucherFormProps = {
  type: "SALE" | "PURCHASE" | "PAYMENT" | "RECEIPT";
  ledgers: { id: string; name: string }[];
  offsetLedgers?: { id: string; name: string }[];
  items?: { id: string; name: string; sellingPrice: number; basePrice: number }[];
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default function VoucherForm({ type, ledgers, offsetLedgers, items = [] }: VoucherFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTrade = type === "SALE" || type === "PURCHASE";

  const form = useForm<VoucherInput>({
    resolver: zodResolver(VoucherSchema) as any,
    defaultValues: {
      type,
      date: new Date(),
      ledgerId: "",
      offsetLedgerId: "",
      totalAmount: 0,
      items: [],
      note: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const calculateTotal = (currentItems: NonNullable<VoucherInput["items"]>) => {
    return currentItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const onSubmit = async (data: VoucherInput) => {
    setIsSubmitting(true);
    try {
      const res = await createVoucherAction(data);
      if (res.success) {
        alert("Voucher Created Successfully!");
        router.push("/vouchers/" + type.toLowerCase());
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{type} VOUCHER</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Top fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...form.register("date")} />
              {form.formState.errors.date && <p className="text-red-500 text-sm">{form.formState.errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>{type === "SALE" ? "Customer" : type === "PURCHASE" ? "Supplier" : "Primary Party"}</Label>
              <select className={selectClass} {...form.register("ledgerId")}>
                <option value="">Select Ledger...</option>
                {ledgers.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              {form.formState.errors.ledgerId && <p className="text-red-500 text-sm">{form.formState.errors.ledgerId.message}</p>}
            </div>

            {offsetLedgers && (
              <div className="space-y-2">
                <Label>{type === "RECEIPT" || type === "PAYMENT" ? "Cash/Bank Account" : "Offset Account"}</Label>
                <select className={selectClass} {...form.register("offsetLedgerId")}>
                  <option value="">Select Account...</option>
                  {offsetLedgers.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Items section */}
          {isTrade && (
            <div className="border p-3 md:p-4 rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm md:text-base">Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: "", quantity: 1, price: 0, total: 0 })}>
                  + Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-3 rounded-lg border bg-muted/30 p-3 md:p-4">
                  {/* Item select — full width */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Item</Label>
                    <select
                      className={selectClass}
                      {...form.register(`items.${index}.itemId` as const)}
                      onChange={(e) => {
                        const item = items.find((i) => i.id === e.target.value);
                        if (item) {
                          const price = type === "SALE" ? item.sellingPrice : item.basePrice;
                          form.setValue(`items.${index}.price`, price);
                          const qty = form.getValues(`items.${index}.quantity`) || 0;
                          form.setValue(`items.${index}.total`, qty * price);
                          form.setValue("totalAmount", calculateTotal(form.getValues("items")!));
                        }
                      }}
                    >
                      <option value="">Select item...</option>
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Qty / Price / Total row */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Qty</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                        onChange={(e) => {
                          const qty = parseFloat(e.target.value) || 0;
                          const price = form.getValues(`items.${index}.price`) || 0;
                          form.setValue(`items.${index}.total`, qty * price);
                          form.setValue("totalAmount", calculateTotal(form.getValues("items")!));
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.price`, { valueAsNumber: true })}
                        onChange={(e) => {
                          const price = parseFloat(e.target.value) || 0;
                          const qty = form.getValues(`items.${index}.quantity`) || 0;
                          form.setValue(`items.${index}.total`, qty * price);
                          form.setValue("totalAmount", calculateTotal(form.getValues("items")!));
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total</Label>
                      <Input disabled type="number" {...form.register(`items.${index}.total`, { valueAsNumber: true })} />
                    </div>
                  </div>

                  {/* Remove button */}
                  <Button type="button" variant="destructive" size="sm" className="w-full md:w-auto" onClick={() => remove(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label>Narration / Note</Label>
              <Input {...form.register("note")} placeholder="Enter transaction note..." />
            </div>
            <div className="space-y-2">
              <Label>Grand Total</Label>
              <Input type="number" step="0.01" {...form.register("totalAmount", { valueAsNumber: true })} readOnly={isTrade} />
              {form.formState.errors.totalAmount && <p className="text-red-500 text-sm">{form.formState.errors.totalAmount.message}</p>}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Save Voucher"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
