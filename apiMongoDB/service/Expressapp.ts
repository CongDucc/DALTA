import express, { Application } from 'express';
import path from 'path';
import cors from 'cors';
import { CategoryRoute } from '../routes/CategoryRoute';
import { ProductRoute } from '../routes/ProductRoute';
import { UserRoute } from '../routes/UsersRoute';
import { OrderRoute } from '../routes/OrderRoutes';
const app = express();

export default async (app: Application) => {
    // Add CORS middleware
    app.use(cors());

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/assets', express.static('assets'));
    app.use('/category', CategoryRoute);
    app.use('/product', ProductRoute);
    app.use('/assets', express.static(path.join(__dirname, '../assets')));
    app.use('/user', UserRoute);
    app.use('/orders', OrderRoute);

    return app;
};