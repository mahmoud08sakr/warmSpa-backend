import Branch from '../../database/model/branch.model.js';
import { AppError } from '../../errorHandling/AppError.js';
import { cityModel } from '../../database/model/city.model.js';
import userModel from '../../database/model/user.model.js';
export const createBranch = async (branchData) => {
    const { city } = branchData
    const newBranch = await Branch.create(branchData);

    let addedCity = await cityModel.findOne({ name: city });
    if (!addedCity) {
        addedCity = await cityModel.create({ name: city, branches: [newBranch._id] });
        return newBranch;
    };
    addedCity.branches.push(newBranch._id);

    await addedCity.save();
    return newBranch;
}
export const getAllBranches = async (query = {}) => {
    try {



        const branches = await Branch.find({ isActive: true })
            .select('-__v')
        console.log(branches);
        console.log('Branches before return:', JSON.stringify(branches, null, 2));
        return branches || [];
    } catch (error) {
        console.error('Error in getAllBranches:', error);
        return [];
    }
};
export const getAllBranchesForAdmin = async (query = {}) => {
    try {


        let userData = await userModel.findById(req.user.id)

        if (userData.role === 'Maneger') {
            const updateBranch = await Branch.find({ manegedBy: req.user.id })
            if (!updateBranch) {
                throw new AppError('No branch found with that ID', 404);
            }
            return updateBranch;
        }
        const branches = await Branch.find({})
            .select('-__v')

        return branches || [];
    } catch (error) {
        console.error('Error in getAllBranches:', error);
        return [];
    }
};
export const getAllBranchesByCity = async (query = {}) => {
    try {
        const branches = await cityModel.find({}).populate({
            path: 'branches',
        })
            .select('-__v')
        console.log(branches);
        console.log('Branches before return:', JSON.stringify(branches, null, 2));
        return branches || [];
    } catch (error) {
        console.error('Error in getAllBranches:', error);
        return [];
    }
};


export const getBranchById = async (id) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid branch ID format', 400);
    }
    const branch = await Branch.findById(id).select('-__v');
    if (!branch) {
        throw new AppError('No branch found with that ID', 404);
    }
    return branch;
};

export const updateBranch = async (id, updateData, user) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid branch ID format', 400);

    }
    let userData = await userModel.findById(user.id)

    if (userData.role === 'Maneger') {
        const updateBranch = await Branch.findOneAndUpdate({ _id: id, manegedBy: user.id }, updateData, {
            new: true,
        })
        if (!updateBranch) {
            throw new AppError('No branch found with that ID', 404);
        }
        return updateBranch;
    }
    const updatedBranch = await Branch.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    ).select('-__v');
    if (!updatedBranch) {
        throw new AppError('No branch found with that ID', 404);
    }
    return updatedBranch;
};

export const deleteBranch = async (id) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid branch ID format', 400);
    }

    const branch = await Branch.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
    );

    if (!branch) {
        throw new AppError('No branch found with that ID', 404);
    }

    return null;
};

export const getBranchesWithin = async (distance, latlng, unit = 'mi') => {
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        throw new AppError('Please provide latitude and longitude in the format lat,lng', 400);
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
        throw new AppError('Invalid latitude or longitude values', 400);
    }

    if (latitude < -90 || latitude > 90) {
        throw new AppError('Latitude must be between -90 and 90 degrees', 400);
    }

    if (longitude < -180 || longitude > 180) {
        throw new AppError('Longitude must be between -180 and 180 degrees', 400);
    }

    const branches = await Branch.find({
        location: {
            $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
        },
        isActive: true
    }).select('-__v');

    return branches;
};
