import { create } from "zustand";
import type { Sell } from "@/types/Sell";
import fetcher from "@/utils/fetcher";

interface SellsState {
    sells: Sell[];
    loadSells: () => void;
}

const useSellsStore = create<SellsState>()(
    (set) => ({
        sells: [],
        loadSells: async () => {
            try {
                const sells = await fetcher({ url: `${import.meta.env.VITE_API_URL}/sells` });
                set({ sells: sells["checks"] });
            } catch (error) {
                console.error("Failed to load sells:", error);
            }
        }
    })
);

export default useSellsStore;
