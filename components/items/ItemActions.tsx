"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteItemAction } from "@/server/actions/database.actions";

type Props = {
  itemId: string;
};

export default function ItemActions({ itemId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleDelete = () => {
    if (!window.confirm("Delete this item? This will remove related stock moves and voucher line items.")) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteItemAction(itemId);
      if (result.success) {
        router.refresh();
      } else {
        setMessage("Delete failed");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <Link href={`/inventory/items/${itemId}/edit`} className="text-primary hover:underline text-sm font-medium">
        Edit
      </Link>
      <Button type="button" variant="destructive" size="sm" disabled={isPending} onClick={handleDelete}>
        {isPending ? "Deleting..." : "Delete"}
      </Button>
      {message && <span className="sr-only">{message}</span>}
    </div>
  );
}
