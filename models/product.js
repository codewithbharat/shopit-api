const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Enter Product Name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },

    price: {
        type: Number,
        required: [true, 'Please Enter Product Price'],
        maxLength: [10, 'Product name cannot exceed 10 characters'], 
        default: 0.0,
    },

    description: {
        type: String,
        required: [true, 'Please Enter complete details of product'],
        maxLength: [1000, 'Product name cannot exceed 1000 characters'], 
    },

    ratings: {
        type: Number,
        default: 0,
    },

    images: [
        {
            public_id: {
                type: String,
            },

            url: {
                type: String,
            },
        }
    ],

    category: {
        type: String,
        enum: {
            values: [
                'Electronics',
                'Cameras',
                'Laptop',
                'Accessories',
                'Headphones',
                'Food',
                'books',
                'Clothes/Shoes',
                'Beauty/health',
                'Sports',
                'Home'
            ],

            message: 'Please select correct category for product.',
        }
    },

    seller: {
        type: String,
    },

    stock: {
        type: Number,
        maxLength: [5, 'Product stock cannot exceed 5 digits.'],
        default: 0,
    },

    numOfReviews: {
        type: Number,
        default: 0,
    },

    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true,
            },
        
            name: {
                type: String,
                required: true,
            },

            rating: {
                type: Number,
                required: true
            },

            comment: {
                type: String,
                required: true 
            }
        }
    ],

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },

    // createdAt : {
    //     type: Date,
    //     default: Date.now
    // }
})

module.exports = mongoose.model('Product', productSchema);