import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MoreVertical, ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
import type { Item } from "../../types/Item";
import useSettingsStore from "../../contexts/SettingsContext";
import ConfirmModal from "../AddPage/ConfirmModal";
import fetcher from "@/utils/fetcher";
import { showToast } from "@/contexts/ToastContext";
import useItemsStore from "@/contexts/ItemsContext";

interface InventoryTableProps {
  items: Item[];
}

export default function InventoryTable({ items }: InventoryTableProps) {
  const navigate = useNavigate();
  const { formatCurrency } = useSettingsStore();
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const { loadItems } = useItemsStore();

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.id.toString().includes(searchQuery)
  );

  const itemsPerPage = Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 30;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filteredItems.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);
  const currentItems = filteredItems.slice(startIndex, endIndex);

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

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const renderStatusBadge = (amount: number) => {
    if (amount === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded uppercase">
          Нет на складе
        </span>
      );
    }
    if (amount < 20) {
      return (
        <span className="inline-flex items-center px-2 py-1 bg-red-400 text-white text-xs font-bold rounded uppercase">
          Низкий
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 bg-[#E3F5CB] text-[#3D7100] text-xs font-bold rounded uppercase">
        В наличии
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="overflow-x-clip">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                ID
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                Название
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                Категория
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                На складе
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                Цена
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                Статус
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-6 text-sm font-medium text-gray-500 w-32">
                  {item.id}
                </td>
                <td className="px-6 py-6">
                  <div className="text-sm font-bold text-gray-900 mb-1">{item.name}</div>
                  <div className="text-xs text-gray-400 leading-tight max-w-[200px]">
                    {item.description}
                  </div>
                </td>
                <td className="px-6 py-6 text-sm font-bold text-gray-500 uppercase tracking-wide">
                  {item.category_id}
                </td>
                <td className="px-6 py-6 text-sm font-bold">
                  {item.amount < 20 ? (
                    <span className="text-red-500 mr-1">{item.amount} критический</span>
                  ) : (
                    <>
                      <span className="text-gray-900 mr-1">{item.amount}</span>
                      <span className="text-gray-400 font-normal">шт</span>
                    </>
                  )}
                </td>
                <td className="px-6 py-6 text-sm font-bold text-gray-900">
                  {formatCurrency(item.original_price)}
                </td>
                <td className="px-6 py-6">
                  {renderStatusBadge(item.amount)}
                </td>
                <td className="px-6 py-6 text-right relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(item.id === activeMenuId ? null : item.id);
                    }}
                    className={`p-1 rounded transition-colors ${activeMenuId === item.id ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <MoreVertical className="w-5 h-5 inline-block" />
                  </button>

                  {activeMenuId === item.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-8 top-12 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-200000 origin-top-right animate-pop-in"
                    >
                      <button
                        onClick={() => {
                          navigate(`/warehouse/edit/${item.id}`);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                        Изменить
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete(item);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500/80" />
                        Удалить
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-500">
          Показано <span className="text-gray-900">{filteredItems.length > 0 ? startIndex + 1 : 0}-{endIndex}</span> из <span className="text-gray-900">{filteredItems.length}</span>
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

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Удаление товара"
        message={
          <span>
            Вы уверены, что хотите удалить товар <b>{itemToDelete?.name}</b>?
          </span>
        }
        confirmText="Удалить"
        onCancel={() => setItemToDelete(null)}
        onConfirm={async () => {
          if (!itemToDelete) return;
          try {
            await fetcher({
              url: `${import.meta.env.VITE_API_URL}/item/${itemToDelete.id}`,
              method: "DELETE",
            })
            showToast("Товар удален", "success");
            setItemToDelete(null);
            loadItems();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Произошла ошибка при удалении товара";
            showToast(errorMessage, "danger");
          }
        }}
      />
    </div>
  );
}
