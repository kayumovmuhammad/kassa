export interface Item {
  id: number;
  name: string;
  description: string;
  image_urls: string[];
  image_preview_urls: string[];
  category_id: number;
  original_price: number;
  amount: number;
}

export interface AddableItem {
  item_id?: number;
  name?: string;
  count: number;
  sell_price: number;
}