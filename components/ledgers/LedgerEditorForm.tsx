"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type LedgerInput, updateLedgerAction } from "@/server/actions/ledger.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  ledgerId: string;
  initialValues: LedgerInput;
};

export default function LedgerEditorForm({ ledgerId, initialValues }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: LedgerInput = {
      name: formData.get("name") as string,
      type: formData.get("type") as LedgerInput["type"],
      phone: (formData.get("phone") as string) || undefined,
    };

    const res = await updateLedgerAction(ledgerId, data);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/ledger");
      router.refresh();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Ledger</h1>
        <p className="text-muted-foreground mt-1">Update account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ledger Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ledger Name *</Label>
                <Input id="name" name="name" required defaultValue={initialValues.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  name="type"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue={initialValues.type}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={initialValues.phone || ""} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
