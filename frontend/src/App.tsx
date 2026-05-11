import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "./components/ui/ToastContainer";
import MainLayout from "./components/Layout/MainLayout";
import AddCheckPage from "./pages/AddCheckPage";
import WarehousePage from "./pages/WarehousePage";
import AddWarehouseItemPage from "./pages/AddWarehouseItemPage";
import EditWarehouseItemPage from "./pages/EditWarehouseItemPage";
import OrdersPage from "./pages/OrdersPage";
import EditCheckPage from "./pages/EditCheckPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import useItemsStore from "./contexts/ItemsContext";
import { useEffect } from "react";
import useSellsStore from "./contexts/SellsContext";
import StatsPage from "./pages/StatsPage";

function App() {
  const { loadItems } = useItemsStore();
  const { loadSells } = useSellsStore();

  useEffect(() => {
    loadItems();
    loadSells();
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<AddCheckPage />} />
          <Route path="warehouse">
            <Route index element={<WarehousePage />} />
            <Route path="add" element={<AddWarehouseItemPage />} />
            <Route path="edit/:id" element={<EditWarehouseItemPage />} />
          </Route>
          <Route path="orders">
            <Route index element={<OrdersPage />} />
            <Route path="edit/:id" element={<EditCheckPage />} />
          </Route>
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
