import ItemsList from "./AddPage/ItemsList";
import OrderSummary from "./AddPage/OrderSummary";

interface CheckEditorProps {
  title: string;
  submitButtonText: string;
  onSubmit: (taxAmount: number) => void | Promise<void>;
}

export default function CheckEditor({ title, submitButtonText, onSubmit }: CheckEditorProps) {
  return (
    <div className="p-5 flex gap-6 items-start h-full">
      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-[32px] font-extrabold text-[#2C2C2C] mb-3 uppercase tracking-tight">{title}</h1>
        </div>
        <ItemsList />
      </div>
      <OrderSummary buttonText={submitButtonText} onSubmit={onSubmit} />
    </div>
  );
}
