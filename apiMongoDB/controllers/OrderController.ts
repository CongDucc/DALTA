import { Request, Response } from 'express';
import { ORDERS } from '../models/OrderModel';
import { OrderParams } from '../dto/Order';
import { USERLOG } from '../models/UserModel';

// Generate a unique order number
const generateOrderNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
};

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
    try {
        const orderData = req.body as OrderParams;
        
        // Generate a unique order number if not provided
        if (!orderData.orderNumber) {
            orderData.orderNumber = generateOrderNumber();
        }
        
        const order = new ORDERS(orderData);
        await order.save();
        
        // Update user orders if userId is provided
        if (orderData.customer.userId) {
            await USERLOG.findByIdAndUpdate(
                orderData.customer.userId,
                { $push: { orders: order._id } }
            );
        }
        
        res.status(201).json({
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to create order: ${error}` });
    }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await ORDERS.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch orders: ${error}` });
    }
};

// Get a single order by ID
export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await ORDERS.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch order: ${error}` });
    }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const updatedOrder = await ORDERS.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.status(200).json({
            message: 'Order status updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({ error: `Failed to update order status: ${error}` });
    }
};

// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const order = await ORDERS.findByIdAndDelete(req.params.id);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Remove reference from user
        if (order.customer.userId) {
            await USERLOG.findByIdAndUpdate(
                order.customer.userId,
                { $pull: { orders: order._id } }
            );
        }
        
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: `Failed to delete order: ${error}` });
    }
};

// Get order statistics (for dashboard)
export const getOrderStats = async (req: Request, res: Response) => {
    try {
        const totalOrders = await ORDERS.countDocuments();
        
        // Count orders by status
        const statusCounts = await ORDERS.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Calculate total revenue
        const revenueData = await ORDERS.aggregate([
            {
                $match: { 
                    status: { $nin: ['cancelled'] },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ]);
        
        // Get recent orders
        const recentOrders = await ORDERS.find()
            .sort({ createdAt: -1 })
            .limit(5);
        
        // Format the response
        const stats = {
            totalOrders,
            statusCounts: statusCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {} as Record<string, number>),
            totalRevenue: revenueData.length > 0 ? revenueData[0].totalRevenue : 0,
            recentOrders
        };
        
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch order statistics: ${error}` });
    }
};

// Get monthly revenue data (for charts)
export const getMonthlyRevenue = async (req: Request, res: Response) => {
    try {
        const monthlyData = await ORDERS.aggregate([
            {
                $match: { 
                    status: { $nin: ['cancelled'] },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: { 
                        year: { $year: "$createdAt" }, 
                        month: { $month: "$createdAt" } 
                    },
                    totalRevenue: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);
        
        // Format the data for charting
        const formattedData = monthlyData.map(item => {
            const date = new Date(item._id.year, item._id.month - 1, 1);
            return {
                month: date.toLocaleString('default', { month: 'short' }),
                year: item._id.year,
                revenue: item.totalRevenue,
                orders: item.orderCount
            };
        });
        
        res.status(200).json(formattedData);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch monthly revenue data: ${error}` });
    }
};
