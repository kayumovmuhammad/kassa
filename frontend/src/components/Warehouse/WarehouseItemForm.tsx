import { useState, useEffect } from "react";
import useSettingsStore from "@/contexts/SettingsContext";
import fetcher from "@/utils/fetcher";
import { showToast } from "@/contexts/ToastContext";
import useItemsStore from "@/contexts/ItemsContext";
import { useAuthStore } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export interface WarehouseItemFormData {
  id?: string | number;
  name: string;
  description: string;
  amount: string | number;
  original_price: string | number;
  category_id?: number;
}

interface WarehouseItemFormProps {
  initialData?: WarehouseItemFormData;
  mode: "add" | "edit";
}

export default function WarehouseItemForm({ initialData, mode }: WarehouseItemFormProps) {
  const navigate = useNavigate();
  const { currencySymbol } = useSettingsStore();
  const { loadItems, addLocalItem, editLocalItem } = useItemsStore();
  const { mode: authMode } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    id: "",
    description: "",
    amount: "",
    original_price: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        id: initialData.id ? String(initialData.id) : "",
        description: initialData.description || "",
        amount: initialData.amount !== undefined ? String(initialData.amount) : "0",
        original_price: initialData.original_price !== undefined ? String(initialData.original_price) : "",
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: formData.id ? Number(formData.id) : undefined,
      name: formData.name,
      description: formData.description,
      category_id: 0,
      amount: Number(formData.amount),
      original_price: Number(formData.original_price),
      image_urls: [],
      image_preview_urls: [],
    };

    try {
      if (authMode === "fiction") {
        const localItem = {
           id: payload.id || Math.floor(Math.random() * 10000) + 1000,
           name: payload.name,
           description: payload.description,
           amount: payload.amount,
           original_price: payload.original_price,
           category_id: 0
        };
        if (mode === "add") {
            addLocalItem(localItem as any);
            showToast("Товар (фейк) успешно добавлен", "success");
        } else {
            editLocalItem(localItem as any);
            showToast("Товар (фейк) успешно обновлен", "success");
        }
        navigate("/warehouse");
        return;
      }

      if (mode === "add") {
        await fetcher({
          url: `${import.meta.env.VITE_API_URL}/item`,
          method: "POST",
          body: payload,
        });
        showToast("Товар успешно добавлен", "success");
      } else {
        await fetcher({
          url: `${import.meta.env.VITE_API_URL}/item`,
          method: "PATCH",
          body: payload,
        });
        showToast("Товар успешно обновлен", "success");
      }

      loadItems();
      navigate("/warehouse");
    } catch (error: any) {
      console.log(error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showToast(`Ошибка: ${errorMessage}`, "danger");
    }
  };

  const labelClass = "block text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-3";
  const inputClass = "w-full px-5 py-4 bg-[#F2F3F5] rounded-lg text-[15px] font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-shadow";
  const numInputClass = `${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
        <div className="md:col-span-2">
          <label className={labelClass}>Название</label>
          <input
            required
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Например: Армированный стальной лист А1"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>ID <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(необязательно)</span></label>
          <input
            type="number"
            name="id"
            value={formData.id}
            onChange={handleChange}
            disabled={mode === "edit"}
            placeholder="84029"
            className={`${numInputClass} ${mode === "edit" ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        </div>

        <div>
          <label className={labelClass}>Количество</label>
          <div className="relative">
            <input
              required
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className={numInputClass}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700 font-medium text-[15px]">
              шт.
            </span>
          </div>
        </div>

        <div>
          <label className={labelClass}>Цена</label>
          <div className="relative">
            <input
              required
              type="number"
              name="original_price"
              value={formData.original_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={numInputClass}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700 font-bold text-[15px]">
              {currencySymbol}
            </span>
          </div>
        </div>

        <div className="md:col-span-2 mt-4 pt-10 border-t border-gray-100">
          <label className={labelClass}>Описание <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(необязательно)</span></label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Подробное описание товара..."
            className={`${inputClass} bg-[#F9FAFB] resize-y`}
          ></textarea>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          type="submit"
          className="btn bg-[#61605A] hover:bg-[#4F4E49] text-white px-8 py-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          {mode === "add" ? "+ Добавить товар" : "Сохранить изменения"}
        </button>
      </div>
    </form>
  );
}
