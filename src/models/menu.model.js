const { default: mongoose } = require("mongoose");

const menuSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Menu name is required"],
        trim: true,
        maxlength: [100, "Menu name cannot exceed 100 characters"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Category is required"],
        ref: 'Category'
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
        maxlength: [300, "Description cannot exceed 300 characters"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"]
    },
    images: {
        type: [String],
        validate: {
            validator: function (images) {
                return images.length <= 3;
            },
            message: "Maximum 3 images allowed"
        },
        default: []
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    // Coffee specific fields
    size: {
        type: [String],
        enum: ["small", "medium", "large"],
        default: ["medium"]
    },
    temperature: {
        type: String,
        enum: ["hot", "cold", "both"],
        default: "hot"
    },
    caffeineLevel: {
        type: String,
        enum: ["none", "low", "medium", "high"],
        default: "medium"
    },
    sugarLevel: {
        type: String,
        enum: ["none", "low", "medium", "high"],
        default: "medium"
    },
    isAlcoholic: {
        type: Boolean,
        default: false
    },
    preparationTime: {
        type: Number, // in minutes
        default: 5,
        min: [1, "Preparation time must be at least 1 minute"]
    },
    ingredients: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Calculate final price after discount
menuSchema.virtual('finalPrice').get(function () {
    const discountAmount = (this.price * this.discount) / 100;
    return this.price - discountAmount;
});

// Ensure virtual fields are included in JSON output
menuSchema.set('toJSON', { virtuals: true });
menuSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Menu", menuSchema);