import useItemsStore from "@/contexts/ItemsContext";
import useSettingsStore from "@/contexts/SettingsContext";
import { showToast } from "@/contexts/ToastContext";
import type { AddableItem } from "@/types/Item";

interface OrderSummaryProps {
  buttonText: string;
  onSubmit: (taxAmount: number) => void | Promise<void>;
}

export default function OrderSummary({ buttonText, onSubmit }: OrderSummaryProps) {
  const { currentItems, currentIncludeTax, currentTaxPercent, setCurrentIncludeTax, setCurrentTaxPercent } = useItemsStore();
  const { formatCurrency } = useSettingsStore();

  const total = currentItems.reduce((acc: number, item: AddableItem) => acc + ((item.sell_price || 0) * (item.count || 0)), 0);
  const tax = currentIncludeTax ? total * (currentTaxPercent / 100) : 0;
  const grandTotal = total + tax;

  const handleCompleteOrder = async () => {
    if (currentItems.length == 0) {
      showToast("Корзина пуста", "danger");
      return;
    }
    for (const item of currentItems) {
      if (item.sell_price <= 0) {
        showToast("Цена указана не правильно", "danger");
        return;
      }
      if (item.count <= 0) {
        showToast("Количество указано не правильно", "danger");
        return;
      }
    }
    await onSubmit(currentIncludeTax ? currentTaxPercent : 0);
  }

  return (
    <div className="bg-(--card-bg-color) rounded-xl p-7 w-[380px] flex-shrink-0 sticky top-5 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 tracking-tight">СВОДКА ЗАКАЗА</h2>

      <div className="space-y-5 text-[15px] mb-8 pb-8 border-b border-gray-200">
        <div className="flex justify-between items-center font-semibold text-gray-500 uppercase tracking-wide">
          <span>Итого</span>
          <span className="text-gray-900">{formatCurrency(total)}</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-semibold text-gray-500 uppercase tracking-wide">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentIncludeTax}
                onChange={(e) => setCurrentIncludeTax(e.target.checked)}
                className="w-4 h-4 text-[#625e54] rounded border-gray-300 focus:ring-[#625e54] cursor-pointer"
              />
              <span>Налог (%)</span>
            </label>
            {currentIncludeTax ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={currentTaxPercent}
                  onChange={(e) => setCurrentTaxPercent(Number(e.target.value))}
                  className="w-12 text-right border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-gray-900">%</span>
              </div>
            ) : (
              <span className="text-gray-400">0%</span>
            )}
          </div>
          {currentIncludeTax && (
            <div className="flex justify-end text-sm text-gray-900 font-medium">
              +{formatCurrency(tax)}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center mb-10">
        <span className="text-4xl font-bold text-[#5c584f]">{formatCurrency(grandTotal)}</span>
      </div>

      <div className="space-y-4">
        <button onClick={handleCompleteOrder} className="w-full bg-[#625e54] hover:bg-[#524e45] text-white font-bold py-4 px-4 rounded-lg shadow-sm transition-colors uppercase tracking-wider text-[15px]">
          {buttonText}
        </button>
      </div>
    </div>
  );
}
