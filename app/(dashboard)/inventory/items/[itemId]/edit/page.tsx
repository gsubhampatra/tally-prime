import { notFound } from "next/navigation";
import { getItemAction } from "@/server/actions/item.actions";
import ItemEditorForm from "@/components/items/ItemEditorForm";

export default async function EditItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = await getItemAction(itemId);

  if (!item) return notFound();

  return (
    <ItemEditorForm
      itemId={itemId}
      initialValues={{
        name: item.name,
        category: item.category || undefined,
        unit: item.unit,
        sellingPrice: item.sellingPrice,
        basePrice: item.basePrice,
      }}
    />
  );
}
