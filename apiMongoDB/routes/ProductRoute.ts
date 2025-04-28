import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { createProduct, getProductByCatID, getProductByID, getAllProducts, deleteProduct, getProductsByPrice, getProductsByPriceRange, updateProduct } from '../controllers/ProductController';

const router = express.Router();

const imagesStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, 'assets');
    },
    filename: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, `${req.body.name}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: imagesStorage,
    fileFilter: (req: Express.Request, file: Express.Multer.File, cb: Function) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).array('images', 5); // Allow up to 5 images

// Create product with error handling
router.post('/createProduct', (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                error: true,
                message: `Multer error: ${err.message}`,
                field: err.field
            });
        } else if (err) {
            return res.status(400).json({
                error: true,
                message: err.message
            });
        }
        await createProduct(req, res);
    });
});

// Add update product endpoint
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async (err: any) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                error: true,
                message: `Multer error: ${err.message}`,
                field: err.field
            });
        } else if (err) {
            return res.status(400).json({
                error: true,
                message: err.message
            });
        }
        try {
            await updateProduct(req, res);
        } catch (error) {
            next(error);
        }
    });
});

router.get('/category/:CatID', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getProductByCatID(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/getProductByID/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getProductByID(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/getAllProducts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllProducts(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteProduct(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/filter', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getProductsByPrice(req, res);
    } catch (error) {
        next(error);
    }
});

// Add this route to your product routes
router.get('/filter/price', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getProductsByPriceRange(req, res);
    } catch (error) {
        next(error);
    }
});

export { router as ProductRoute };