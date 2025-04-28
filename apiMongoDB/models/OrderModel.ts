import mongoose, { Schema } from "mongoose";
import { OrderParams } from "../dto/Order";

const OrderItemSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    image: String
});

const AddressSchema = new Schema({
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
});

const CustomerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String
});

const OrderSchema = new Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: CustomerSchema,
        required: true
    },
    items: {
        type: [OrderItemSchema],
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: AddressSchema,
        required: true
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    notes: String
}, {
    timestamps: true
});

const ORDERS = mongoose.model<OrderParams>("orders", OrderSchema);
export { ORDERS };
