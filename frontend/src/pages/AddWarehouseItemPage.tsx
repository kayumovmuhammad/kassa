import { ArrowLeft, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WarehouseItemForm from "../components/Warehouse/WarehouseItemForm";

export default function AddWarehouseItemPage() {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-[900px] mx-auto min-h-screen bg-[#FAFAFA]">
      <div className="mb-8">
        <button
          onClick={() => navigate("/warehouse")}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Назад на склад
        </button>
        <h1 className="text-[32px] font-extrabold text-[#2C2C2C] mb-3 uppercase tracking-tight flex items-center gap-3">
          <PackagePlus className="w-8 h-8 text-[#61605A]" />
          Добавить товар
        </h1>
      </div>

      <WarehouseItemForm mode="add" />
    </div>
  );
}
