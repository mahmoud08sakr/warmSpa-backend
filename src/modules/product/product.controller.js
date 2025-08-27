import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductStats,
    getProductsByBranch
} from './product.service.js';
import { handleAsyncError } from '../../errorHandling/handelAsyncError.js';

export const createProductHandler = handleAsyncError(async (req, res) => {
    const product = await createProduct(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            product
        }
    });
});


export const getAllProductsHandler = handleAsyncError(async (req, res) => {
    const products = await getAllProducts(req.query);

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });
});


export const getProductHandler = handleAsyncError(async (req, res) => {
    const product = await getProductById(req.params.id);

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});


export const updateProductHandler = handleAsyncError(async (req, res) => {
    const product = await updateProduct(req.params.id, req.body);

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

export const deleteProductHandler = handleAsyncError(async (req, res) => {
    await deleteProduct(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});


export const getProductStatsHandler = handleAsyncError(async (req, res) => {
    const stats = await getProductStats();

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

export const getProductsByBranchHandler = handleAsyncError(async (req, res) => {
    const products = await getProductsByBranch(req.params.branchId);

    res.status(200).json({
        status: 'success',
        results: products.length,
        data: {
            products
        }
    });
});
