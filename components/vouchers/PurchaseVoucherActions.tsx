"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deletePurchaseVoucherAction } from "@/server/actions/database.actions";

type Props = {
  voucherId: string;
};

export default function PurchaseVoucherActions({ voucherId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleDelete = () => {
    if (!window.confirm("Delete this purchase voucher? This will remove its stock movements and ledger entries.")) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deletePurchaseVoucherAction(voucherId);
      if (result.success) {
        router.refresh();
      } else {
        setMessage("Delete failed");
      }
    });
  };

  return (
    <div className="flex items-center gap-3 justify-end">
      <Link href={`/vouchers/purchase/${voucherId}/edit`} className="text-primary hover:underline text-sm font-medium">
        Edit
      </Link>
      <Button type="button" variant="destructive" size="sm" disabled={isPending} onClick={handleDelete}>
        {isPending ? "Deleting..." : "Delete"}
      </Button>
      {message && <span className="sr-only">{message}</span>}
    </div>
  );
}
