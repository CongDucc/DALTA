export interface OrderItemParams {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface AddressParams {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface CustomerParams {
    userId?: string;
    name: string;
    email: string;
    phone?: string;
}

export interface OrderParams {
    orderNumber: string;
    customer: CustomerParams;
    items: OrderItemParams[];
    totalAmount: number;
    shippingAddress: AddressParams;
    shippingCost: number;
    tax: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: string;
    paymentStatus: 'pending' | 'paid' | 'failed';
    notes?: string;
}
