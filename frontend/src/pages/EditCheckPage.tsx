import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useItemsStore from "@/contexts/ItemsContext";
import useSellsStore from "@/contexts/SellsContext";
import { showToast } from "@/contexts/ToastContext";
import CheckEditor from "@/components/CheckEditor";
import fetcher from "@/utils/fetcher";

export default function EditCheckPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentItems, clearCurrentItems, loadCheckIntoDraft } = useItemsStore();
  const { sells, loadSells } = useSellsStore();

  useEffect(() => {
    if (!id) return;
    const sell = sells.find((s) => s.id === Number(id));

    if (sell) {
      loadCheckIntoDraft(sell);
    } else {
      showToast("Чек не найден", "danger");
      navigate("/orders");
    }

    return () => {
      // clear drafts if user leaves page
      clearCurrentItems();
    };
  }, [id, sells]); // Depends on sells loading as well

  const handleSaveChanges = async (taxPercent: number) => {
    try {
      await fetcher({
        url: `${import.meta.env.VITE_API_URL}/sell`,
        method: "PATCH",
        body: {
          id: Number(id),
          items: currentItems,
          taxes: taxPercent,
        },
      });


      clearCurrentItems();
      loadSells();
      showToast("Изменения успешно сохранены", "success");

      navigate("/orders");
    } catch (error) {
      showToast(`Ошибка сервера ${error}`, "danger");
      console.log(error);
    }
  };

  return (
    <CheckEditor
      title={`Редактирование чека #${id}`}
      submitButtonText="Сохранить изменения"
      onSubmit={handleSaveChanges}
    />
  );
}
