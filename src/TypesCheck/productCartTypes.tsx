import { JSX } from "react";

export interface ProductListParams {
    _id: string;
    images: [string];
    name: string;
    price: number;
    oldPrice?: number;
    color?: string;
    size?: string;
    description?: string;
    quantity: number;
    inStock?: boolean;
    isFeatured?: boolean;
    category?: string;
}

export interface CartItem {
    cart: ProductListParams[];
}

export interface CartState {
    cart: {
        cart: ProductListParams[];
        length: number;
    }
}

export enum SortOption {
    NONE = "none",
    PRICE_LOW_TO_HIGH = "priceLowToHigh",
    PRICE_HIGH_TO_LOW = "priceHighToLow"
}
