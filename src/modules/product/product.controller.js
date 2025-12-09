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
import RequestDiscountModel from '../../database/model/requestDescount.model.js';
import OrderDiscountModel from '../../database/model/order.reciption.model.js';
import Room from '../../database/model/room.model.js';
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


export const requestDiscout = handleAsyncError(async (req, res) => {

    let { branchId, requiestPrice, reson, products, reseptionist, roomId, customerName, customerPhone, gender, paymentMethod, currency } = req.body
    let productData = []
    for (let i = 0; i < products.length; i++) {
        const product = await getProductById(products[i].productId);
        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found'
            })
        }
        productData.push({ productId: products[i].productId })
    }
    const requestDiscount = await RequestDiscountModel.create({
        branchId,
        requiestPrice,
        reson,
        products: productData,
        reseptionist, roomId
    })
    let roomData = await Room.findById(roomId);
    if (!roomData) {
        throw new AppError('Room not found', 404);
    } else {
        roomData.isReserved = false;
        roomData.customerName = customerName;
        roomData.customerPhone = customerPhone;
        roomData.gender = gender;
        roomData.paymentMethod = paymentMethod;
        roomData.currency = currency;
        await roomData.save();
    }


    res.status(201).json({
        status: 'success',
        data: {
            requestDiscount
        }
    })
})

export const approveDiscountHandler = handleAsyncError(async (req, res) => {
    console.log(req.params);

    const requestDiscount = await RequestDiscountModel.findById(req.params.id);
    if (!requestDiscount) {
        return res.status(404).json({
            status: 'fail',
            message: 'Request Discount not found'
        })
    }
    if (requestDiscount.status === 'approved') {
        return res.status(400).json({
            status: 'fail',
            message: 'Request Discount already approved'
        })
    }
    requestDiscount.status = 'approved';
    await requestDiscount.save();
    let updateRoomStatus = await Room.findOneAndUpdate({ _id: requestDiscount.roomId }, { isReserved: true }, { new: true });
    console.log(updateRoomStatus, "update the product data");

    res.status(200).json({
        status: 'success',
        data: {
            requestDiscount
        }
    })
})


export const rejectDiscountHandler = handleAsyncError(async (req, res) => {
    const requestDiscount = await RequestDiscountModel.findById(req.params.id);
    if (!requestDiscount) {
        return res.status(404).json({
            status: 'fail',
            message: 'Request Discount not found'
        })
    }
    if (requestDiscount.status === 'rejected') {
        return res.status(400).json({
            status: 'fail',
            message: 'Request Discount already rejected'
        })
    }
    requestDiscount.status = 'rejected';
    await requestDiscount.save();
    res.status(200).json({
        status: 'success',
        data: {
            requestDiscount
        }
    })
})



export const makeTheOrderAfterApproveDiscountHandler = handleAsyncError(async (req, res) => {
    const requestDiscount = await RequestDiscountModel.findById(req.params.id);
    let { userName, phone } = req.body
    if (!requestDiscount) {
        return res.status(404).json({
            status: 'fail',
            message: 'Request Discount not found'
        })
    }
    if (requestDiscount.status === 'approved') {

        const count = requestDiscount.products.length || 1;
        const perItemPrice = Number(requestDiscount.requiestPrice) / count;
        const products = requestDiscount.products.map(p => ({ productId: p.productId, price: perItemPrice }));
        const totalAmount = Number(requestDiscount.requiestPrice);

        const order = await OrderDiscountModel.create({
            branchId: requestDiscount.branchId,
            userName,
            phone,
            products,
            totalAmount
        })

        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        })
    }
})

export const getDiscountRequestHandler = handleAsyncError(async (req, res) => {
    const requestDiscount = await RequestDiscountModel.find();
    res.status(200).json({
        status: 'success',
        data: {
            requestDiscount
        }
    })
})

export const getDiscountRequestHandlerForBranch = handleAsyncError(async (req, res) => {
    const requestDiscount = await RequestDiscountModel.find({ branchId: req.params.branchId });
    res.status(200).json({
        status: 'success',
        data: {
            requestDiscount
        }
    })
})