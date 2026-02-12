import mongoose from 'mongoose';
import Product from '../../database/model/product.model.js';
import { AppError } from '../../errorHandling/AppError.js';

// Create a new product (Admin only)
export const createProduct = async (productData) => {
    productData.branchId = new mongoose.Types.ObjectId(productData.branchId);
    const newProduct = await Product.create(productData);
    return newProduct;
};

// Get all products with filtering, sorting, pagination
export const getAllProducts = async (query) => {
    try {
        // 1) Filtering
        const queryObj = { ...query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 2) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // Build the query
        let dbQuery = Product.find(JSON.parse(queryStr))
            .populate('branch', 'name address city')
            .where('isActive', true);

        // 3) Sorting
        if (query.sort) {
            const sortBy = query.sort.split(',').join(' ');
            dbQuery = dbQuery.sort(sortBy);
        } else {
            dbQuery = dbQuery.sort('-createdAt');
        }

        // 4) Field limiting
        if (query.fields) {
            const fields = query.fields.split(',').join(' ');
            dbQuery = dbQuery.select(fields);
        } else {
            dbQuery = dbQuery.select('-__v');
        }
        // Execute the query
        const products = await dbQuery;

        // Return empty array instead of throwing error when no products exist
        return products;
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        return [];
    }
};

// Get product by ID (Public)
export const getProductById = async (id) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid product ID format', 400);
    }

    const product = await Product.findById(id)
        .populate('branch', 'name address city')
        .where('isActive', true);

    if (!product) {
        throw new AppError('No product found with that ID', 404);
    }

    return product;
};

// Update product (Admin only)
export const updateProduct = async (id, updateData) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid product ID format', 400);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    ).populate('branch', 'name address city');

    if (!updatedProduct) {
        throw new AppError('No product found with that ID', 404);
    }

    return updatedProduct;
};

export const deleteProduct = async (id) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid product ID format', 400);
    }

    const product = await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!product) {
        throw new AppError('No product found with that ID', 404);
    }

    return null;
};

export const getProductStats = async () => {
    try {
        const stats = await Product.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: '$category',
                    numProducts: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    avgDuration: { $avg: '$duration' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            }
        ]);
        return stats;
    } catch (error) {
        console.error('Error in getProductStats:', error);
        return [];
    }
};


export const getProductsByBranch = async (branchId) => {
    if (!branchId || !branchId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid branch ID format', 400);
    }

    const products = await Product.find({
        branch: branchId,
        isActive: true
    })
        .select('-__v')
        .populate('branch', 'name address city')
        .sort({ createdAt: -1 });

    return products;
};
