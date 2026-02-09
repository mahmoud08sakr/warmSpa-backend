import { createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch, getBranchesWithin, getAllBranchesByCity, getAllBranchesForAdmin } from './branch.service.js';
import { handleAsyncError } from '../../errorHandling/handelAsyncError.js';
import { AppError } from '../../errorHandling/AppError.js';
import Product from '../../database/model/product.model.js';
import Room from '../../database/model/room.model.js';
import Branch from '../../database/model/branch.model.js';


export const getUserDetails = async (req, res, next) => {
    let { id } = req.user
    console.log(id, 'from iddddddddddddddd');

    let branchData = await Branch.findOne({ userAccountId: id }).populate({
        path: 'services.serviceId',
        model: 'Product',
        select: 'name price duration description'
    })
    if (!branchData) {
        return next(new AppError(`No branch found with ID: ${userAccountId[i]}`, 404));
    }
    res.json({
        message: "branchData",
        branchData
    })
}

export const createBranchHandler = handleAsyncError(async (req, res, next) => {
    let { services, roomNumber, branchAdminAccountId } = req.body
    req.body.spaRooms = roomNumber
    let productsIds = []
    if (services && services.length > 0) {
        productsIds = services.map(service => service.serviceId);
    }
    for (let i = 0; i < productsIds.length; i++) {
        let branch = await Product.findById(productsIds[i]);
        console.log();
        if (!branch) {
            return next(new AppError(`No branch found with ID: ${productsIds[i]}`, 404));
        }
    }
    if (req.body.target !== undefined) {
        const t = Number(req.body.target);
        if (Number.isNaN(t) || t < 0) {
            return next(new AppError('Invalid target: must be a non-negative number', 400));
        }
        req.body.target = t;
    }
    const branch = await createBranch(req.body);
    for (let i = 1; i <= roomNumber; i++) {
        let createdRooms = await Room.create({
            roomNumber: i,
            branchId: branch._id
        });
        console.log(createdRooms);
        if (!createdRooms) {
            return next(new AppError(`No branch found with ID: ${roomNumber[i]}`, 404));
        }
    }
    res.status(201).json({
        status: 'success',
        data: {
            branch
        }
    });
});


export const addService = handleAsyncError(async (req, res, next) => {
    let { serviceId, serviceIds } = req.body
    let { branchId } = req.params

    if (!serviceIds && serviceId) {
        serviceIds = [serviceId]
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
        return next(new AppError('serviceIds must be a non-empty array', 400));
    }

    serviceIds = [...new Set(serviceIds.map(String))]

    const existingServices = await Product.find({ _id: { $in: serviceIds } }).select('_id')
    if (existingServices.length !== serviceIds.length) {
        const existingIds = new Set(existingServices.map(s => String(s._id)))
        const missingIds = serviceIds.filter(id => !existingIds.has(String(id)))
        return next(new AppError(`No service found with ID(s): ${missingIds.join(', ')}`, 404));
    }

    let branch = await Branch.findById(branchId)
    if (!branch) {
        return next(new AppError(`no branch found with ID: ${branchId}`))
    }

    const existingBranchServiceIds = new Set((branch.services || []).map(s => String(s.serviceId)))
    const toAdd = serviceIds.filter(id => !existingBranchServiceIds.has(String(id)))
    for (const id of toAdd) {
        branch.services.push({ serviceId: id })
    }

    await branch.save()

    await Product.updateMany(
        { _id: { $in: serviceIds } },
        { $addToSet: { branch: branchId } }
    )

    res.status(200).json({
        status: 'success',
        data: {
            branch
        }
    })
})
export const getAllBranchesHandler = handleAsyncError(async (req, res) => {
    try {
        const branches = await getAllBranches(req.query)

        res.status(200).json({
            status: 'success',
            results: branches ? branches.length : 0,
            data: {
                branches: branches || []
            }
        });
    } catch (error) {
        console.error('Error in getAllBranchesHandler:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch branches',
            error: {
                en: 'Failed to fetch branches. Please try again later.',
                ar: 'فشل في جلب الفروع. يرجى المحاولة مرة أخرى لاحقًا.'
            }
        });
    }
});

export const getAllBranchesByAdminHandler = handleAsyncError(async (req, res) => {
    try {
        const branches = await getAllBranchesForAdmin(req.user.id, req.query)
        res.status(200).json({
            status: 'success',
            results: branches ? branches.length : 0,
            data: {
                branches: branches || []
            }
        });
    } catch (error) {
        console.error('Error in getAllBranchesHandler:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch branches',
            error: {
                en: 'Failed to fetch branches. Please try again later.',
                ar: 'فشل في جلب الفروع. يرجى المحاولة مرة أخرى لاحقًا.'
            }
        });
    }
});

export const getAllBranchesCityHandler = handleAsyncError(async (req, res) => {
    try {
        const branches = await getAllBranchesByCity(req.query)

        res.status(200).json({
            status: 'success',
            results: branches ? branches.length : 0,
            data: {
                branches: branches || []
            }
        });
    } catch (error) {
        console.error('Error in getAllBranchesHandler:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch branches',
            error: {
                en: 'Failed to fetch branches. Please try again later.',
                ar: 'فشل في جلب الفروع. يرجى المحاولة مرة أخرى لاحقًا.'
            }
        });
    }
});


export const getBranchHandler = handleAsyncError(async (req, res) => {
    const branch = await getBranchById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: {
            branch
        }
    });
});

export const updateBranchHandler = handleAsyncError(async (req, res) => {
    if (req.body.target !== undefined) {
        const t = Number(req.body.target);
        if (Number.isNaN(t) || t < 0) {
            throw new AppError('Invalid target: must be a non-negative number', 400);
        }
        req.body.target = t;
    }
    const branch = await updateBranch(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: {
            branch
        }
    });
});


export const deleteBranchHandler = handleAsyncError(async (req, res) => {
    await deleteBranch(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});


export const getBranchesWithinHandler = handleAsyncError(async (req, res) => {
    const { distance, latlng, unit = 'mi' } = req.query;
    if (!distance || !latlng) {
        throw new AppError('Please provide distance and latlng in the format lat,lng', 400);
    }
    if (isNaN(distance) || distance <= 0) {
        throw new AppError('Distance must be a positive number', 400);
    }
    if (!/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(latlng)) {
        throw new AppError('Please provide latlng in the format lat,lng (e.g., 30.0444,31.2357)', 400);
    }
    if (!['mi', 'km'].includes(unit)) {
        throw new AppError('Unit must be either "mi" (miles) or "km" (kilometers)', 400);
    }
    const branches = await getBranchesWithin(distance, latlng, unit);
    res.status(200).json({
        status: 'success',
        results: branches.length,
        data: {
            branches
        }
    });
});

