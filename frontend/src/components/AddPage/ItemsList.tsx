import useItemsStore from "@/contexts/ItemsContext";
import useSettingsStore from "@/contexts/SettingsContext";
import type { AddableItem } from "@/types/Item";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

export default function ItemsList() {
  const { currentItems, editCurrentItem, deleteItemByIndex, items } = useItemsStore();
  const { formatCurrency, currencySymbol } = useSettingsStore();
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 mt-6 mb-8">
      {/* Header */}
      <div className="grid grid-cols-[1.5fr_4.5fr_1.5fr_1.5fr_1.5fr] gap-4 px-6 py-4 bg-(--card-bg-color) rounded-t-lg border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider items-center">
        <div>ID</div>
        <div>Описание</div>
        <div>Цена</div>
        <div>Кол-во</div>
        <div>Итого</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {currentItems.map((addableItem: AddableItem, index: number) => {
          let item = items.find((item) => item.id === addableItem.item_id);
          if (!item) {
            if (addableItem.name == undefined) {
              deleteItemByIndex(index);
              return <></>;
            }
            item = {
              id: -1,
              name: addableItem.name,
              amount: 0,
              original_price: 0,
              category_id: 0,
              image_urls: [],
              image_preview_urls: [],
              description: ""
            };
          }

          const isLowStock = item.amount < 10;
          return (
            <div
              key={`${item.id}-${index}`}
              className="grid grid-cols-[1.5fr_4.5fr_1.5fr_1.5fr_1.5fr] gap-4 px-6 py-6 border-b border-gray-100 last:border-b-0 items-center transition-colors hover:bg-gray-50/50"
            >
              <div className="text-sm font-medium text-gray-600 font-mono">
                {item.id != -1 ? item.id.toString() : "Новый товар"}
              </div>
              <div className="flex flex-col gap-1.5 pr-4">
                <div className="text-[15px] font-semibold text-gray-900 leading-tight">
                  {item.name}
                </div>
                {item.id != -1 && item.amount != undefined && <div className={`text-[10px] font-bold uppercase tracking-wider ${isLowStock ? 'text-red-700/80' : 'text-gray-500/80'}`}>
                  {isLowStock ? `Мало на складе: ${item.amount} шт.` : `В наличии: ${item.amount} шт.`}
                </div>
                }
              </div>

              <div className="flex items-center text-gray-900 text-[15px] font-medium">
                <span className="text-gray-400 mr-1.5">{currencySymbol}</span>
                <input
                  autoFocus
                  type="number"
                  value={addableItem.sell_price || ""}
                  onChange={(e) => editCurrentItem(index, { ...addableItem, sell_price: +e.target.value })}
                  className="w-16 border-b border-gray-200 pb-0.5 focus:outline-none focus:border-gray-800 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                />
              </div>

              <div>
                <div className="inline-flex items-center bg-gray-100 rounded p-1">
                  <button
                    onClick={() => {
                      if (addableItem.count <= 1) {
                        setItemToDelete(index);
                      } else {
                        editCurrentItem(index, { ...addableItem, count: addableItem.count - 1 });
                      }
                    }}
                    className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <input
                    type="number"
                    value={addableItem.count || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        editCurrentItem(index, { ...addableItem, count: 0 });
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed) && parsed >= 0) {
                          editCurrentItem(index, { ...addableItem, count: parsed });
                        }
                      }
                    }}
                    onBlur={() => {
                      // Ensure minimum count of 1 if user leaves it empty or 0
                      if (!addableItem.count || addableItem.count < 1) {
                        editCurrentItem(index, { ...addableItem, count: 1 });
                      }
                    }}
                    className="w-10 text-center text-sm font-bold text-gray-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-300 rounded mx-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => editCurrentItem(index, { ...addableItem, count: addableItem.count + 1 })}
                    className="p-1 hover:bg-white hover:shadow-sm rounded text-gray-700 transition-all"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="text-[15px] font-bold text-gray-900">
                {formatCurrency(addableItem.sell_price * addableItem.count || 0)}
              </div>
            </div>
          );
        })}
        {currentItems.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-sm bg-white rounded-b-lg">
            Список товаров пуст
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={itemToDelete !== null}
        title="Удаление товара"
        message="Вы уверены, что хотите удалить этот товар из списка для оформления?"
        confirmText="Удалить"
        onConfirm={() => {
          if (itemToDelete !== null) {
            deleteItemByIndex(itemToDelete);
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
