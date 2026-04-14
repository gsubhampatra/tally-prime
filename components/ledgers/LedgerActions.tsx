"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteLedgerAction } from "@/server/actions/database.actions";

type Props = {
  ledgerId: string;
};

export default function LedgerActions({ ledgerId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleDelete = () => {
    if (!window.confirm("Delete this ledger? This will remove related vouchers and ledger entries.")) return;

    setMessage(null);
    startTransition(async () => {
      const result = await deleteLedgerAction(ledgerId);
      if (result.success) {
        router.push("/ledger");
        router.refresh();
      } else {
        setMessage("Delete failed");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <Link href={`/ledger/${ledgerId}/edit`} className="text-primary hover:underline text-sm font-medium">
        Edit
      </Link>
      <Button type="button" variant="destructive" size="sm" disabled={isPending} onClick={handleDelete}>
        {isPending ? "Deleting..." : "Delete"}
      </Button>
      {message && <span className="sr-only">{message}</span>}
    </div>
  );
}
