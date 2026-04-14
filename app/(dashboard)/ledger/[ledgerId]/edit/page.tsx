import { notFound } from "next/navigation";
import { getLedgerAction } from "@/server/actions/ledger.actions";
import LedgerEditorForm from "@/components/ledgers/LedgerEditorForm";

export default async function EditLedgerPage({ params }: { params: Promise<{ ledgerId: string }> }) {
  const { ledgerId } = await params;
  const ledger = await getLedgerAction(ledgerId);

  if (!ledger) return notFound();

  return (
    <LedgerEditorForm
      ledgerId={ledgerId}
      initialValues={{
        name: ledger.name,
        type: ledger.type,
        phone: ledger.phone || undefined,
      }}
    />
  );
}
