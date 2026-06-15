export interface RivhitItem {
  item_id: number;
  item_name: string;
  item_part_num: string | null;
  barcode: string | null;
  sale_nis: number;
  picture_link: string | null;
  quantity: number;
  item_group_id: number;
}

export interface ProductOverride {
  rivhit_item_id: number;
  custom_name: string | null;
  custom_price: number | null;
  custom_image: string | null;
  is_hidden: boolean;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface CatalogProduct {
  itemId: number;
  sku: string;
  name: string;
  price: number;
  image: string | null;
  categoryId: string;
  categoryName: string;
  categorySortOrder: number;
}

export interface Store {
  id: string;
  store_name: string;
  username: string;
  created_at: string;
}

export interface CartItem {
  sku: string;
  quantity: number;
}

export interface SessionData {
  role: "store" | "admin";
  storeId?: string;
  storeName?: string;
  username?: string;
}
