const express = require('express');
const router = express.Router();

const { 
    createNewOrder,
    getSingleOrder,
    myOrders,
    allOrders,
    updateOrder,
    deleteOrder 
} = require('../controlers/orderControler');

const { isAuthenticatedUser , authorizeRoles} = require('../middlewares/auth');

router.route('/order/new').post(isAuthenticatedUser, createNewOrder);
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/orders/me').get(isAuthenticatedUser, myOrders);

// admin only routes

router.route('/admin/orders').get(isAuthenticatedUser, authorizeRoles('admin'), allOrders);
router.route('/admin/order/:id')
        .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
        .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder)

module.exports = router;