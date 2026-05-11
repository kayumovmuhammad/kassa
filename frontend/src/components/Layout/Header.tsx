import { Search, Bell, CircleUser } from "lucide-react";
import AddBar from "@/components/AddPage/AddBar";
import { useLocation, useSearchParams } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isWarehousePage = location.pathname === "/warehouse";
  const isOrdersPage = location.pathname === "/orders";
  const showSearchBar = isWarehousePage || isOrdersPage;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      searchParams.set("search", e.target.value);
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      {showSearchBar ? (
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              className="w-full bg-[#f0f2f1] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
              placeholder={isWarehousePage ? "Поиск по инвентарю (название, описание, ID, ...)" : "Поиск по заказам (ID, товары, ...)"}
              value={searchParams.get("search") || ""}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      ) : (
        <AddBar />
      )}
      <div className="flex items-center gap-6 text-gray-600">
        <button className="hover:text-gray-900 transition-colors">
          <Bell size={20} />
        </button>
        <button className="hover:text-gray-900 transition-colors">
          <CircleUser size={24} />
        </button>
      </div>
    </header>
  );
}
