const mongoose = require("mongoose");

const colorVariantSizeSchema = new mongoose.Schema({
    size: { type: String, required: true, trim: true },
    sku:  { type: String, required: true, trim: true },
    countInStock: { type: Number, required: true, default: 0, min: 0 },
}, { _id: false });

const colorVariantSchema = new mongoose.Schema({
    color:     { type: String, required: true, trim: true },
    colorName: { type: String, trim: true, default: "" },
    images: [{
        url:     { type: String, required: true },
        altText: { type: String },
    }],
    sizes: [colorVariantSizeSchema],
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
    },
    offerPercentage: {
        type: Number,
        default: 0,
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
    sku: {
        type: String,
        unique: true,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
    },
    sizes: {
        type: [String],
        required: true,
    },
    colors: {
        type: [String],
        required: true,
    },
    // New structured variant system: one entry per color, each with its own images & sizes
    colorVariants: [colorVariantSchema],
    // Legacy flat variants (kept for backwards compatibility with old products)
    variants: [
        {
            designName: {
                type: String,
                trim: true,
                default: "Default",
            },
            color: {
                type: String,
                required: true,
                trim: true,
            },
            size: {
                type: String,
                required: true,
                trim: true,
            },
            sku: {
                type: String,
                required: true,
                trim: true,
            },
            countInStock: {
                type: Number,
                required: true,
                default: 0,
                min: 0,
            },
        },
    ],
    collections: {
        type: String,
        required: true,
    },
    material: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["Men", "Women", "Kids"],
    },
    images: [
        {
            url: {
                type: String,
                required: true,
            },
            altText: {
                type: String,
            },
        },
    ],
    sizeChart: {
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SizeChart",
        },
        imageUrl: {
            type: String,
            default: "",
        },
        measureImageUrl: {
            type: String,
            default: "",
        },
        title: {
            type: String,
            default: "Size Chart",
        },
        audience: {
            type: String,
            enum: ["Men", "Women", "Kids", "Unisex"],
            default: "Unisex",
        },
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
        default: 0,
    },
    numReviews: {
        type: Number,
        default: 0,
    },
    tags: [String],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    metaTitle: {
        type: String,
    },
    metaDescription: {
        type: String,
    },
    metaKeywords: {
        type: String,
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
    },
    weight: Number,
},
{timestamps: true}
);

module.exports = mongoose.model("Product", productSchema);
