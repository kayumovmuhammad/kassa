import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Item, AddableItem } from "@/types/Item";
import type { Sell } from "@/types/Sell";
import fetcher from "@/utils/fetcher";

interface ItemsState {
  items: Item[];
  currentItems: AddableItem[];
  addItem: (id: number) => void;
  addItembyName: (name: string) => void;
  deleteItemByIndex: (index: number) => void;
  editCurrentItem: (index: number, newItem: AddableItem) => void;
  loadItems: () => void;
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
