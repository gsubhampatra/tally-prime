"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type ItemInput, updateItemAction } from "@/server/actions/item.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  itemId: string;
  initialValues: ItemInput;
};

export default function ItemEditorForm({ itemId, initialValues }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: ItemInput = {
      name: formData.get("name") as string,
      category: (formData.get("category") as string) || undefined,
      unit: formData.get("unit") as string,
      sellingPrice: parseFloat(formData.get("sellingPrice") as string) || 0,
      basePrice: parseFloat(formData.get("basePrice") as string) || 0,
    };

    const res = await updateItemAction(itemId, data);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/inventory/items");
      router.refresh();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Item</h1>
        <p className="text-muted-foreground mt-1">Update inventory item details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input id="name" name="name" required defaultValue={initialValues.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" defaultValue={initialValues.category || ""} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input id="unit" name="unit" required defaultValue={initialValues.unit} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (₹) *</Label>
                <Input id="basePrice" name="basePrice" type="number" step="0.01" required defaultValue={initialValues.basePrice} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price (₹) *</Label>
                <Input id="sellingPrice" name="sellingPrice" type="number" step="0.01" required defaultValue={initialValues.sellingPrice} />
              </div>
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
