import { ProductListParams } from "./HomeProp";
import { CategoryParams } from "./HomeProp";

export interface ProductFormData {
  _id?: string;
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  quantity: number;
  inStock: boolean;
  isFeatured: boolean;
  category: string;
  images: string[];
}

export interface CategoryFormData {
  _id?: string;
  name: string;
  images: string[];
}

export interface AdminProductState {
  products: ProductListParams[];
  categories: CategoryParams[];
  loading: boolean;
  error: string | null;
  currentProduct: ProductFormData | null;
}

export interface AdminCategoryState {
  categories: CategoryParams[];
  loading: boolean;
  error: string | null;
  currentCategory: CategoryFormData | null;
}

export interface ModalState {
  visible: boolean;
  type: 'create' | 'edit' | 'delete' | null;
  itemId?: string;
}
