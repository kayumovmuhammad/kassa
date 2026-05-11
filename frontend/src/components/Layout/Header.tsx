import { Search } from "lucide-react";
import AddBar from "@/components/AddPage/AddBar";
import { useLocation, useSearchParams } from "react-router-dom";
import Clock from "./Clock";
import Calculator from "./Calculator";
import { useEffect, useRef } from "react";

export default function Header() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isWarehousePage = location.pathname === "/warehouse";
  const isOrdersPage = location.pathname === "/orders";
  const showSearchBar = isWarehousePage || isOrdersPage;

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "k" || e.key === "K" || e.key === "л" || e.key === "Л")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
              ref={searchInputRef}
              type="text"
              className="w-full bg-[#f0f2f1] rounded-lg py-2 pl-10 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
              placeholder={
                isWarehousePage
                  ? "Поиск по инвентарю (название, описание, ID, ...)"
                  : "Поиск по заказам (ID, товары, ...)"
              }
              value={searchParams.get("search") || ""}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      ) : (
        <AddBar ref={searchInputRef} />
      )}
      <div className="ml-4 flex items-center gap-6">
        <Calculator />
        <Clock />
      </div>
    </header>
  );
}
