import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Branch name is required'],
        trim: true,
        maxlength: [100, 'Branch name cannot exceed 100 characters']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function (v) {
                return /^[+]?[0-9]{10,15}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: [true, 'Location coordinates are required'],
            validate: {
                validator: function (coords) {
                    return coords.length === 2 &&
                        coords[0] >= -180 && coords[0] <= 180 && // longitude
                        coords[1] >= -90 && coords[1] <= 90;     // latitude
                },
                message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90'
            }
        }
    },
    workingHours: {
        monday: { type: String, default: '9:00 AM - 6:00 PM' },
        tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
        wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
        thursday: { type: String, default: '9:00 AM - 6:00 PM' },
        friday: { type: String, default: '9:00 AM - 6:00 PM' },
        saturday: { type: String, default: '10:00 AM - 4:00 PM' },
        sunday: { type: String, default: 'Closed' }
    },
    services: [{
        serviceSname: {
            type: String,
            enum: ['Massage', 'Facial', 'Body Treatment', 'Spa Package', 'Other'],
            trim: true
        },
        price: {
            type: Number,
            min: [0, 'Service price cannot be negative']
        }
    }],
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for location for geospatial queries
branchSchema.index({ location: '2dsphere' });

// Indexes for better query performance
branchSchema.index({ city: 1, country: 1, isActive: 1 });
branchSchema.index({ name: 'text', city: 'text', country: 'text' });

// Virtual for full address
branchSchema.virtual('fullAddress').get(function () {
    return `${this.address}, ${this.city}, ${this.state}, ${this.country}`;
});

// Pre-save hook to ensure coordinates are in correct format [longitude, latitude]
branchSchema.pre('save', function (next) {
    if (this.location && this.location.coordinates && this.location.coordinates.length === 2) {
        // MongoDB expects [longitude, latitude] order
        const [lng, lat] = this.location.coordinates;
        if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
            this.location.coordinates = [lng, lat];
        }
    }
    next();
});

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;