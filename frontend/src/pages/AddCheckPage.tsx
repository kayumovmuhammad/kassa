import useItemsStore from "@/contexts/ItemsContext";
import useSellsStore from "@/contexts/SellsContext";
import { showToast } from "@/contexts/ToastContext";
import fetcher from "@/utils/fetcher";
import CheckEditor from "@/components/CheckEditor";

export default function AddCheckPage() {
  const { currentItems, clearCurrentItems } = useItemsStore();
  const { loadSells } = useSellsStore();

  const handleCompleteOrder = async (taxPercent: number) => {
    try {
      console.log(currentItems);
      await fetcher({
        url: `${import.meta.env.VITE_API_URL}/sell`,
        method: "POST",
        body: {
          items: currentItems,
          taxes: taxPercent,
        },
      });

      clearCurrentItems();
      showToast("Заказ успешно завершен", "success");
      loadSells();

    } catch (error) {
      showToast(`Ошибка сервера ${error}`, "danger");
      console.log(error);
    }
  };

  return (
    <CheckEditor
      title="Текущий заказ"
      submitButtonText="Завершить сделку"
      onSubmit={handleCompleteOrder}
    />
  );
}
