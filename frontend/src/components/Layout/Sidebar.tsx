import { NavLink } from "react-router-dom";
import {
  Grid,
  Box,
  ShoppingCart,
  Settings,
  BarChart2,
} from "lucide-react";

export default function Sidebar() {
  const sidebarLinks = [
    { to: "/", icon: <Grid size={20} />, label: "Панель управления" },
    { to: "/warehouse", icon: <Box size={20} />, label: "Склад" },
    { to: "/orders", icon: <ShoppingCart size={20} />, label: "Заказы" },
    { to: "/stats", icon: <BarChart2 size={20} />, label: "Статистика" },
    { to: "/settings", icon: <Settings size={20} />, label: "Настройки" },
  ];

  // const bottomLinks = [
  //   { to: "/help", icon: <HelpCircle size={20} />, label: "Помощь" },
  // ];

  return (
    <aside
      className="w-64 min-h-screen flex flex-col justify-between py-8 px-4 border-r border-gray-200"
      style={{ backgroundColor: "#e2e6e4" }}
    >
      <div>
        <div className="mb-10 px-4">
          <h1 className="text-xl font-bold tracking-wider text-gray-800">
            ТОРГОВЫЙ ПОРТ
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
            Технический отдел
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-[#eff1f0] text-gray-900 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-[#d8dcd9]"
                }`
              }
            >
              <div className="text-gray-600">{link.icon}</div>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
