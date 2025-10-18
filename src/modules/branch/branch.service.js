import Branch from '../../database/model/branch.model.js';
import { AppError } from '../../errorHandling/AppError.js';
export const createBranch = async (branchData) => {

    const newBranch = await Branch.create(branchData);
    return newBranch;
};
export const getAllBranches = async (query = {}) => {
  try {
    const { city, country, isActive = true, page = 1, limit = 10 } = query;
    const filter = { isActive };
    if (city) filter.city = new RegExp(city, 'i');
    if (country) filter.country = new RegExp(country, 'i');
    const skip = (page - 1) * limit;

    // Log the filter to ensure it's correct
    console.log('Filter:', filter);

    const branches = await Branch.find(filter)
      .populate({
        path: 'services.serviceId',
        model: 'Product',
        select: 'name price duration description'
      })
      .select('-__v')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Log the raw branches data to inspect the population
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

export const updateBranch = async (id, updateData) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid branch ID format', 400);
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
