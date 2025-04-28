import express, { Request, Response } from 'express';
import { 
    createOrder, 
    getAllOrders, 
    getOrderById, 
    updateOrderStatus, 
    deleteOrder,
    getOrderStats,
    getMonthlyRevenue
} from '../controllers/OrderController';

const router = express.Router();

// Define handlers as separate functions to avoid TypeScript errors
const handleCreateOrder = (req: Request, res: Response) => {
    createOrder(req, res);
};

const handleGetAllOrders = (req: Request, res: Response) => {
    getAllOrders(req, res);
};

const handleGetOrderStats = (req: Request, res: Response) => {
    getOrderStats(req, res);
};

const handleGetMonthlyRevenue = (req: Request, res: Response) => {
    getMonthlyRevenue(req, res);
};

const handleGetOrderById = (req: Request, res: Response) => {
    getOrderById(req, res);
};

const handleUpdateOrderStatus = (req: Request, res: Response) => {
    updateOrderStatus(req, res);
};

const handleDeleteOrder = (req: Request, res: Response) => {
    deleteOrder(req, res);
};

// Order CRUD routes with defined handlers
router.post('/', handleCreateOrder);
router.get('/', handleGetAllOrders);
router.get('/stats', handleGetOrderStats);
router.get('/monthly-revenue', handleGetMonthlyRevenue);
router.get('/:id', handleGetOrderById);
router.put('/:id/status', handleUpdateOrderStatus);
router.delete('/:id', handleDeleteOrder);

export { router as OrderRoute };
