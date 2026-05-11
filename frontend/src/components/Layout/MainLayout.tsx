import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useEffect } from "react";
import useItemsStore from "@/contexts/ItemsContext";

export default function MainLayout() {
  const { loadItems } = useItemsStore();
  const path = useLocation();

  useEffect(() => {
    loadItems();
  }, [path.pathname]);

  return (
    <div className="flex min-h-screen text-gray-900">
      <Sidebar />
      <div className="flex-1 w-full flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
