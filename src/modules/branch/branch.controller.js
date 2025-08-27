import { createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch, getBranchesWithin } from './branch.service.js';
import { handleAsyncError } from '../../errorHandling/handelAsyncError.js';
import { AppError } from '../../errorHandling/AppError.js';

export const createBranchHandler = handleAsyncError(async (req, res) => {
    const branch = await createBranch(req.body);
console.log(branch , 'branch');

    res.status(201).json({
        status: 'success',
        data: {
            branch
        }
    });
});

export const getAllBranchesHandler = handleAsyncError(async (req, res) => {
    try {
        const branches = await getAllBranches(req.query);

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
    const branch = await updateBranch(req.params.id, req.body );
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
