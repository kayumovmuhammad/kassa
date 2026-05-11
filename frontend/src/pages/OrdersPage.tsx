import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useSellsStore from "@/contexts/SellsContext";
import useSettingsStore from "@/contexts/SettingsContext";
import { Undo, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import fetcher from "@/utils/fetcher";
import { showToast } from "@/contexts/ToastContext";

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('ru-RU', { month: 'long' });
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${capitalizedMonth}, ${year} • ${hours}:${minutes}`;
};

export default function OrdersPage() {
  const { sells, loadSells } = useSellsStore();
  const { formatCurrency } = useSettingsStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const filteredAndSortedSells = useMemo(() => {
    let result = [...sells].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(sell => {
        if (sell.id.toString().includes(lowerQuery)) return true;
        
        const year = new Date(sell.created_at).getFullYear();
        const orderId = `#chk-${year}-${String(sell.id).padStart(4, '0')}`;
        if (orderId.includes(lowerQuery)) return true;

        if (sell.items?.some(item => item.name.toLowerCase().includes(lowerQuery))) return true;

        return false;
      });
    }

    return result;
  }, [sells, searchQuery]);

  const itemsPerPage = Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 30;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredAndSortedSells.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filteredAndSortedSells.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredAndSortedSells.length);
  const currentSells = filteredAndSortedSells.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const handleReturn = async (sellId: number) => {
    try {
      await fetcher({
        url: `${import.meta.env.VITE_API_URL}/sell/${sellId}`,
        method: "DELETE",
      });
      loadSells();
      showToast("Заказ успешно возвращен", "success");
    } catch (error) {
      showToast("Ошибка при возврате заказа", "danger");
    }
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#FAFAFA]">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div className="max-w-xl">
          <h1 className="text-[32px] font-extrabold text-[#2C2C2C] mb-3 uppercase tracking-tight">
            Список заказов
          </h1>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {currentSells.map((sell) => {
          const year = new Date(sell.created_at).getFullYear();
          const orderId = `#CHK-${year}-${String(sell.id).padStart(4, '0')}`;

          const subTotal = sell.items?.reduce(
            (sum, item) => sum + item.count * item.sell_price,
            0
          ) || 0;

          const taxPercentage = sell.taxes ? Number(sell.taxes) : 0;
          const taxAmount = (subTotal * taxPercentage) / 100;
          const totalAmount = subTotal + taxAmount;

          return (
            <div key={sell.id} className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              {/* Top Row: ID ЗАКАЗА and ИТОГО */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ID ЗАКАЗА</div>
                  <div className="text-xl font-bold text-gray-800 mb-1">{orderId}</div>
                  <div className="text-sm text-gray-500">{formatDate(sell.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ИТОГО</div>
                  <div className="text-2xl font-bold text-gray-800">{formatCurrency(totalAmount)}</div>
                </div>
              </div>

              <hr className="border-gray-50 my-6" />

              {/* Middle Section: СОСТАВ ЗАКАЗА */}
              <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">СОСТАВ ЗАКАЗА</div>
              <div className="flex flex-col mb-6">
                {(sell.items || []).map((item, idx) => {
                  return (
                    <div key={idx} className="flex justify-between items-center text-sm py-2">
                      <div className="flex-1 text-gray-600 pr-4">{item.name}</div>
                      <div className="w-24 text-gray-400 text-right">{formatCurrency(item.sell_price)}</div>
                      <div className="w-16 text-gray-500 text-right">x{item.count}</div>
                      <div className="w-32 font-semibold text-gray-700 text-right">
                        {formatCurrency(item.sell_price * item.count)}
                      </div>
                    </div>
                  );
                })}

                {/* Tax row below items */}
                {taxPercentage > 0 && (
                  <div className="flex justify-end items-center text-sm py-2 mt-4 pt-4 border-t border-gray-50/80">
                    <span className="text-gray-400 mr-6 text-xs uppercase tracking-wider">Налог ({taxPercentage}%)</span>
                    <span className="font-bold text-gray-800 w-32 text-right">{formatCurrency(taxAmount)}</span>
                  </div>
                )}
              </div>

              {/* Button Section */}
              <div className="flex justify-end gap-3 mt-2">
                <button 
                  onClick={() => handleReturn(sell.id)} 
                  className="flex items-center gap-2 px-5 py-2.5 bg-transparent hover:bg-gray-50 transition-colors rounded-lg text-xs font-bold text-gray-400 hover:text-gray-600 tracking-wide"
                  title="Оформить возврат"
                >
                  <Undo className="w-4 h-4" />
                  ВОЗВРАТ
                </button>
                <button 
                  onClick={() => navigate(`/orders/edit/${sell.id}`)} 
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FFEACC] hover:bg-[#FFDFB3] transition-colors rounded-lg text-xs font-bold text-[#D97706] tracking-wide"
                  title="Изменить чек"
                >
                  <Pencil className="w-4 h-4" />
                  ИЗМЕНИТЬ
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAndSortedSells.length > 0 && (
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500">
            Показано <span className="text-gray-900">{startIndex + 1}-{endIndex}</span> из <span className="text-gray-900">{filteredAndSortedSells.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded text-sm font-bold flex items-center justify-center transition-colors ${
                  currentPage === pageNum 
                    ? "bg-gray-600 text-white" 
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
