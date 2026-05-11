import { useEffect } from "react";
import { Plus, CopyX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useItemsStore from "../contexts/ItemsContext";
import useSettingsStore from "../contexts/SettingsContext";
import StatCard from "../components/Warehouse/StatCard";
import InventoryTable from "../components/Warehouse/InventoryTable";

export default function WarehousePage() {
  const { items, loadItems } = useItemsStore();
  const { formatCurrency } = useSettingsStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#FAFAFA]">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div className="max-w-xl">
          <h1 className="text-[32px] font-extrabold text-[#2C2C2C] mb-3 uppercase tracking-tight">
            Инвентарь
          </h1>
        </div>
        <button
          onClick={() => navigate("/warehouse/add")}
          className="btn self-start shrink-0 flex items-center gap-2 bg-[#61605A] hover:bg-[#4F4E49] text-white px-6 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Добавить товар
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Всего позиций" value={items.length.toString()} />
        <StatCard
          title="Низкий остаток"
          value={items.filter(i => i.amount < 20).length.toString()}
          valueColor="text-[#D94F4F]"
        />
        <StatCard
          title="Общая стоимость"
          value={formatCurrency(items.reduce((acc, curr) => acc + (curr.original_price * curr.amount || 0), 0))}
        />
        <StatCard
          title="Заказов сегодня"
          value="0"
          valueColor="text-[#6B8E23]"
        />
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center mt-8">
          <div className="bg-gray-50 rounded-full p-6 mb-4">
            <CopyX className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">На складе пока нет товаров</h2>
          <p className="text-gray-500 max-w-sm mb-6">
            Ваш инвентарь пуст. Добавьте свои первые товары для начала отслеживания остатков.
          </p>
          <button
            onClick={() => navigate("/warehouse/add")}
            className="btn bg-[#61605A] hover:bg-[#4F4E49] text-white px-6 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            Добавить товар
          </button>
        </div>
      ) : (
        <InventoryTable items={items} />
      )}
    </div>
  );
}
