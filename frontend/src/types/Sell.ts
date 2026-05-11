export interface Sell {
    id: number;
    taxes: number;
    created_at: string;
    items: SellItem[];
}

export interface SellItem {
    item_id?: number;
    name: string;
    count: number;
    sell_price: number;
}