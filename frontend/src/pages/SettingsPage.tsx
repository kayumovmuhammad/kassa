import useSettingsStore from "../contexts/SettingsContext";
import type { Currency } from "../contexts/SettingsContext";

export default function SettingsPage() {
  const { currency, setCurrency } = useSettingsStore();

  const currencies: { value: Currency; label: string; symbol: string }[] = [
    { value: "RUB", label: "Российский рубль", symbol: "₽" },
    { value: "USD", label: "Доллар США", symbol: "$" },
    { value: "TJS", label: "Таджикский сомони", symbol: "SM" },
    { value: "EUR", label: "Евро", symbol: "€" },
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#FAFAFA]">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div className="max-w-xl">
          <h1 className="text-[32px] font-extrabold text-[#2C2C2C] mb-3 uppercase tracking-tight flex items-center gap-3">
            Настройки
          </h1>
        </div>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest">
            Региональные настройки
          </h2>
        </div>
        
        <div className="p-8">
          <div className="max-w-md">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
              Валюта по умолчанию
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currencies.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCurrency(c.value)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                    currency === c.value
                      ? "border-[#61605A] bg-[#61605A]/5 text-gray-900 shadow-sm"
                      : "border-gray-100 bg-white hover:border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-semibold text-[15px]">{c.label}</span>
                  <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                    currency === c.value 
                      ? "bg-[#61605A] text-white" 
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {c.symbol}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              Выбранная валюта будет использоваться для расчетов и отображения цен на складе и при оформлении заказов.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
