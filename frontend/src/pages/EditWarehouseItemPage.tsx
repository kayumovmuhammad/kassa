import { useEffect, useState } from "react";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import WarehouseItemForm, { type WarehouseItemFormData } from "../components/Warehouse/WarehouseItemForm";
import useItemsStore from "@/contexts/ItemsContext";
import { showToast } from "@/contexts/ToastContext";

export default function EditWarehouseItemPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { items } = useItemsStore();
  const [initialData, setInitialData] = useState<WarehouseItemFormData | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const itemToEdit = items.find((item) => String(item.id) === id);
      if (itemToEdit) {
        setInitialData({
          id: itemToEdit.id,
          name: itemToEdit.name,
          category_id: itemToEdit.category_id,
          amount: itemToEdit.amount,
          original_price: itemToEdit.original_price,
          description: itemToEdit.description || "",
        });
      } else {
        showToast("Товар не найден", "danger");
        navigate("/warehouse");
      }
    }
  }, [id, items, navigate]);

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
          <PackageCheck className="w-8 h-8 text-[#61605A]" />
          Изменить товар
        </h1>
      </div>

      {initialData ? (
        <WarehouseItemForm mode="edit" initialData={initialData} />
      ) : (
        <div className="flex justify-center my-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
}
