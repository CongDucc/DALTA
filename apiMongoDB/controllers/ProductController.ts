import express, { Request, Response } from 'express'
import { PRODUCTS } from '../models/ProductModel'
import { ProductParams } from '../dto/product'; // Changed from Product to product

const path = 'http://localhost:9000/assets/'
export const createProduct = async (req: Request, res: Response) => {
    const { name, price, oldPrice, description, quantity, inStock, isFeatured,
        category } = <ProductParams>req.body;

    const files = req.files as [Express.Multer.File];
    const images = files.map((file: Express.Multer.File) => path + file.filename)

    const product = new PRODUCTS({
        name: name,
        images: images,
        price, oldPrice, description, quantity, inStock, isFeatured, category
    });

    try {
        console.log(product)
        await product.save();
        res.status(200).json(`Product create successfully :-) + ${path}!!!`)
    } catch (error) {
        res.status(500).json(`Failed to create Product ${error}:-(`)
    }

}
export const getProductByCatID = async (req: Request, res: Response) => {
    try {
        const products = await PRODUCTS.find({ category: req.params.CatID });
        console.log('Found products:', products);
        res.status(200).json(products);
    } catch (error: any) {
        console.error('Error in getProductByCatID:', error);
        res.status(500).json({ error: `Failed to fetch products: ${error.message}` });
    }
};

export const getProductByID = async (req: Request, res: Response) => {
    try {
        const result = await PRODUCTS.findById(req.params.id)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json(`Product fetch failed ${error} :-( `)
    }
}

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const result = await PRODUCTS.find().sort({ createdAt: -1 }) // 
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json(`Products not found ${error} :-( `)
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await PRODUCTS.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error: any) {
        console.error('Error in deleteProduct:', error);
        res.status(500).json({ error: `Failed to delete product: ${error.message}` });
    }
};
export const getProductsByPrice = async (req: Request, res: Response) => {
    try {
        const maxPrice = Number(req.query.maxPrice) || 1000;
        const products = await PRODUCTS.find({
            price: { $lte: maxPrice }
        });

        if (!products || products.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(products);
    } catch (error: any) {
        console.error('Error in getProductsByPrice:', error);
        res.status(500).json({
            error: `Failed to fetch products by price: ${error.message}`
        });
    }
};

// Add this controller method
export const getProductsByPriceRange = async (req: Request, res: Response) => {
    try {
        const minPrice = Number(req.query.minPrice) || 0;
        const maxPrice = Number(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;

        const products = await PRODUCTS.find({
            price: { $gte: minPrice, $lte: maxPrice }
        });

        res.status(200).json(products);
    } catch (error: any) {
        console.error('Error in getProductsByPriceRange:', error);
        res.status(500).json({ error: `Failed to fetch products by price range: ${error.message}` });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, price, oldPrice, description, quantity, inStock, isFeatured,
            category, existingImages } = req.body;
            
        console.log("Update request body:", req.body);
        console.log("Files received:", req.files);
        
        // Prepare update data
        const updateData: any = {
            name,
            price: parseFloat(price),
            description,
            quantity: parseInt(quantity),
            inStock: inStock === 'true' || inStock === true,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            category
        };
        
        // Add oldPrice if provided
        if (oldPrice) {
            updateData.oldPrice = parseFloat(oldPrice);
        }
        
        // Handle images
        const files = req.files as [Express.Multer.File];
        
        // Parse existingImages if it's a string (JSON)
        let parsedExistingImages: string[] = [];
        if (existingImages) {
            try {
                parsedExistingImages = typeof existingImages === 'string' 
                    ? JSON.parse(existingImages) 
                    : (Array.isArray(existingImages) ? existingImages : [existingImages]);
                    
                console.log("Parsed existing images:", parsedExistingImages);
            } catch (e) {
                console.error("Error parsing existingImages:", e);
                parsedExistingImages = typeof existingImages === 'string' 
                    ? [existingImages] 
                    : (Array.isArray(existingImages) ? existingImages : []);
            }
        }
        
        // Add new images
        let allImages: string[] = [...parsedExistingImages];
        if (files && files.length > 0) {
            const path = 'http://localhost:9000/assets/';
            const newImages = files.map((file: Express.Multer.File) => path + file.filename);
            console.log("New images to add:", newImages);
            allImages = [...allImages, ...newImages];
        }
        
        // Only update images if there are any
        if (allImages.length > 0) {
            updateData.images = allImages;
        }
        
        console.log("Final update data:", updateData);
        
        // Update the product
        const updatedProduct = await PRODUCTS.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: `Failed to update product: ${error}` });
    }
};