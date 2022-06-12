const express = require('express');
const router = express.Router();

const { getProducts,
    newProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductsReviews,
    deleteReview
} = require('../controlers/productControler');

const { isAuthenticatedUser, authorizeRoles} = require('../middlewares/auth');
const { estimatedDocumentCount } = require('../models/product');

router.route('/products').get(getProducts);
router.route('/products/:id').get(getSingleProduct);

router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews').get(isAuthenticatedUser, getProductsReviews);
router.route('/reviews').delete(isAuthenticatedUser, deleteReview);

// admin routes
router.route('/admin/products/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.route('/admin/products/edit/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.route('/admin/products/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);


module.exports = router;