import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item, AddableItem } from "@/types/Item";
import type { Sell } from "@/types/Sell";
import fetcher from "@/utils/fetcher";
import { useAuthStore } from "./AuthContext";

interface ItemsState {
  items: Item[];
  currentItems: AddableItem[];
  addItem: (id: number) => void;
  addItembyName: (name: string) => void;
  deleteItemByIndex: (index: number) => void;
  editCurrentItem: (index: number, newItem: AddableItem) => void;
  loadItems: () => void;
  addLocalItem: (item: Item) => void;
  editLocalItem: (item: Item) => void;
  clearCurrentItems: () => void;
  currentTaxPercent: number;
  currentIncludeTax: boolean;
  setCurrentTaxPercent: (percent: number) => void;
  setCurrentIncludeTax: (include: boolean) => void;
  loadCheckIntoDraft: (sell: Sell) => void;
}

const useItemsStore = create<ItemsState>()(
  persist(
    (set) => ({
      items: [],
      currentItems: [],
      currentTaxPercent: 6,
      currentIncludeTax: false,
      addItem: (id: number) => {
        set((state) => {
          const index = state.items.findIndex((item) => item.id === id);
          if (index != -1) {
            const currentItemIndex = state.currentItems.findIndex((item) => item.item_id === id);

            if (currentItemIndex !== -1) {
              const updatedCurrentItems = [...state.currentItems];
              updatedCurrentItems[currentItemIndex] = {
                ...updatedCurrentItems[currentItemIndex],
                count: updatedCurrentItems[currentItemIndex].count + 1
              };

              return {
                currentItems: updatedCurrentItems
              };
            }

            const item: AddableItem = {
              item_id: id,
              count: 1,
              sell_price: 0
            };

            return {
              currentItems: [
                ...state.currentItems,
                item
              ],
            };
          }
          return state;
        });
      },
      addItembyName: (name: string) => {
        set((state) => {
          const item: AddableItem = {
            name: name,
            count: 1,
            sell_price: 0,
          };
          return {
            currentItems: [...state.currentItems, item],
          };
        });
      },
      deleteItemByIndex: (index: number) => {
        set((state) => {
          const currentItems = [...state.currentItems];
          currentItems.splice(index, 1);
          return { currentItems };
        })
      },
      editCurrentItem: (index: number, newItem: AddableItem) => {
        set((state) => {
          const currentItems = [...state.currentItems];
          currentItems[index] = newItem;
          return { currentItems };
        })
      },
      loadItems: async () => {
        const authMode = useAuthStore.getState().mode;
        if (authMode === "fiction") {
            const fakeItems: Item[] = [
                { id: 101, name: "Мышка Logitech M34", description: "Беспроводная мышь", amount: 45, original_price: 1200, category_id: 0, image_urls: [], image_preview_urls: [] },
                { id: 102, name: "Клавиатура Razer BlackWidow", description: "Механическая клавиатура", amount: 12, original_price: 8500, category_id: 0, image_urls: [], image_preview_urls: [] },
                { id: 103, name: "Монитор LG 27UL500", description: "4K Монитор 27 дюймов", amount: 5, original_price: 24000, category_id: 0, image_urls: [], image_preview_urls: [] },
                { id: 104, name: "Кабель HDMI 2.0 (2м)", description: "Высокоскоростной HDMI кабель", amount: 120, original_price: 450, category_id: 0, image_urls: [], image_preview_urls: [] },
                { id: 105, name: "Наушники Sony WH-1000XM4", description: "Беспроводные наушники с шумоподавлением", amount: 8, original_price: 29990, category_id: 0, image_urls: [], image_preview_urls: [] },
                { id: 106, name: "SSD накопитель Samsung 980 1TB", description: "NVMe M.2 SSD", amount: 24, original_price: 8900, category_id: 0, image_urls: [], image_preview_urls: [] },
                { id: 107, name: "USB Флешка Kingston 64GB", description: "USB 3.2 Gen 1", amount: 85, original_price: 750, category_id: 0, image_urls: [], image_preview_urls: [] },
                { id: 108, name: "Коврик для мыши SteelSeries QcK", description: "Игровой коврик, размер M", amount: 30, original_price: 1100, category_id: 0, image_urls: [], image_preview_urls: [] },
                { id: 109, name: "Блок питания Corsair RM850x", description: "850W, 80 Plus Gold", amount: 7, original_price: 12500, category_id: 0, image_urls: [], image_preview_urls: [] },
                { id: 110, name: "Сетевой фильтр APC 5 розеток", description: "Защита от перенапряжения, 1.8м", amount: 50, original_price: 1800, category_id: 0, image_urls: [], image_preview_urls: [] },
            ];
            set({ items: fakeItems });
            return;
        }

        try {
          const data = await fetcher({
            url: `${import.meta.env.VITE_API_URL}/item/all`,
            method: "GET",
          })
          set({ items: data });
        } catch (error) {
          console.error(error);
        }
      },
      addLocalItem: (item: Item) => set((state) => ({ items: [item, ...state.items] })),
      editLocalItem: (item: Item) => set((state) => ({ 
          items: state.items.map(i => i.id === item.id ? item : i) 
      })),
      clearCurrentItems: () => {
        set({ currentItems: [], currentIncludeTax: false, currentTaxPercent: 6 });
      },
      setCurrentTaxPercent: (percent: number) => set({ currentTaxPercent: percent }),
      setCurrentIncludeTax: (include: boolean) => set({ currentIncludeTax: include }),
      loadCheckIntoDraft: (sell: Sell) => {
        const mappedItems: AddableItem[] = sell.items.map(item => ({
          item_id: item.item_id,
          name: item.name,
          count: item.count,
          sell_price: item.sell_price,
        }));

        const taxVal = sell.taxes ? Number(sell.taxes) : 0;

        set({
          currentItems: mappedItems,
          currentTaxPercent: taxVal > 0 ? taxVal : 6,
          currentIncludeTax: taxVal > 0
        });
      }
    }),
    {
      name: "items-store",
      partialize: (state) => ({
        currentItems: state.currentItems,
        currentTaxPercent: state.currentTaxPercent,
        currentIncludeTax: state.currentIncludeTax,
      }),
    }
  )
);

export default useItemsStore;
