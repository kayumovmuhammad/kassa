import { create } from "zustand";
import type { Sell } from "@/types/Sell";
import fetcher from "@/utils/fetcher";
import { useAuthStore } from "./AuthContext";

interface SellsState {
    sells: Sell[];
    loadSells: () => void;
    addSellLocal: (sell: Sell) => void;
}

const generateFakeSells = (): Sell[] => {
    return [
        {
            id: 1,
            taxes: 6,
            items: [
                { item_id: 101, name: "Мышка Logitech M34", count: 3, sell_price: 1200 }
            ],
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
            id: 2,
            taxes: 6,
            items: [
                { item_id: 103, name: "Монитор LG 27UL500", count: 1, sell_price: 24000 },
                { item_id: 102, name: "Клавиатура Razer BlackWidow", count: 1, sell_price: 8500 }
            ],
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
            id: 3,
            taxes: 0,
            items: [
                { item_id: 105, name: "Наушники Sony WH-1000XM4", count: 1, sell_price: 29990 }
            ],
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        },
        {
            id: 4,
            taxes: 6,
            items: [
                { item_id: 104, name: "Кабель HDMI 2.0 (2м)", count: 4, sell_price: 450 }
            ],
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        },
        {
            id: 5,
            taxes: 6,
            items: [
                { item_id: 106, name: "SSD накопитель Samsung 980 1TB", count: 1, sell_price: 8900 },
                { item_id: 108, name: "Коврик для мыши SteelSeries QcK", count: 1, sell_price: 1100 }
            ],
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        }
    ];
};

const useSellsStore = create<SellsState>()(
    (set) => ({
        sells: [],
        loadSells: async () => {
            const authMode = useAuthStore.getState().mode;
            if (authMode === "fiction") {
                set({ sells: generateFakeSells() });
                return;
            }
            try {
                const sells = await fetcher({ url: `${import.meta.env.VITE_API_URL}/sells` });
                set({ sells: sells["checks"] });
            } catch (error) {
                console.error("Failed to load sells:", error);
            }
        },
        addSellLocal: (sell) => set((state) => ({ sells: [sell, ...state.sells] })),
    })
);

export default useSellsStore;
