import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxlength: [1000, 'Product description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price must be a positive number']
    },
    discountPrice: {
        type: Number,
        validate: {
            validator: function(value) {
                return !value || value < this.price;
            },
            message: 'Discount price must be less than the regular price'
        }
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: ['Massage', 'Facial', 'Body Treatment', 'Spa Package', 'Other'],
            message: 'Please select a valid category'
        }
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Service duration is required'],
        min: [5, 'Duration must be at least 5 minutes'],
        max: [480, 'Duration cannot exceed 8 hours']
    },
    images: [{
        type: String,
        validate: {
            validator: function(v) {
                return /^https?:\/\//.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'Branch reference is required']
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    features: [{
        type: String,
        trim: true,
        maxlength: [100, 'Feature cannot exceed 100 characters']
    }],
    benefits: [{
        type: String,
        trim: true,
        maxlength: [200, 'Benefit cannot exceed 200 characters']
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ branch: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ duration: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toFixed(2)}`;
});

// Virtual for formatted duration
productSchema.virtual('formattedDuration').get(function() {
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (this.discountPrice && this.price > 0) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
});

// Pre-save hook to ensure discount price is not greater than regular price
productSchema.pre('save', function(next) {
    if (this.discountPrice && this.discountPrice >= this.price) {
        this.discountPrice = undefined;
    }
    next();
});

// Pre-save hook to ensure rating average is within bounds
productSchema.pre('save', function(next) {
    if (this.rating && this.rating.average) {
        this.rating.average = Math.max(0, Math.min(5, this.rating.average));
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
