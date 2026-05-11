import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "RUB" | "USD" | "TJS" | "EUR";

interface SettingsState {
  currency: Currency;
  currencySymbol: string;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
}

const getCurrencySymbol = (currency: Currency) => {
  switch (currency) {
    case "RUB": return "₽";
    case "USD": return "$";
    case "TJS": return "SM";
    case "EUR": return "€";
    default: return "";
  }
};

const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      currency: "RUB",
      currencySymbol: "₽",
      setCurrency: (currency: Currency) => {
        set({ currency, currencySymbol: getCurrencySymbol(currency) });
      },
      formatCurrency: (amount: number) => {
        const { currency } = get();
        const symbol = getCurrencySymbol(currency);
        
        // You can customize the locales per currency if needed, 
        // e.g. "en-US" for USD, "ru-RU" for RUB/TJS. 
        // For numbers formatting, ru-RU does space separators: 1 000,00
        const formattedNumber = amount.toLocaleString("ru-RU", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        
        // E.g. TJS -> "1 000.00 SM" or "SM 1 000.00"
        // Most symbols look good before the number except maybe TJS/RUB which sometimes go after.
        // Let's standardise on Symbol Prefix for consistency with the design: `₽1,450.00`
        const space = currency === "TJS" ? " " : "";
        return `${symbol}${space}${formattedNumber}`;
      },
    }),
    {
      name: "settings-store",
    }
  )
);

export default useSettingsStore;
