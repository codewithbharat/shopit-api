const Order = require('../models/order');
const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const order = require('../models/order');

// create a new order => /api/v1/order/new
exports.createNewOrder = catchAsyncErrors( async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        message: "order created",
        order
    })

});

// get single order => /api/v1/order/:id

exports.getSingleOrder = catchAsyncErrors( async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if(!order){
        return next( new ErrorHandler('Product not found by this ID.', 404));
    }

    res.status(200).json({
        success: true,
        order 
    })
});


// get logged in user orders => /api/v1/orders/me

exports.myOrders = catchAsyncErrors( async (req, res, next) => {
    const orders = await Order.find({ user : req.user.id});

    res.status(200).json({
        success: true,
        message: 'Order found',
        orders
    })
});

// get all orders - ADMIN => /api/v1/admin/oders/

exports.allOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })
 
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

// update / procces order - ADMIN => /api/v1/admin/oder/:id

exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(order.orderStatus ==='Delivered') {
        return next(new ErrorHandler('Product already deliverd', 400))
    }

    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity);
    });

    order.orderStatus = req.body.status,
    order.deliveredAt = Date.now()

    await order.save();
 
    res.status(200).json({
        success: true,
        order
    });
});

async function updateStock(id, quantity){
    const product = await Product.findById(id);

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false})
}


// delete order => /api/v1/admin/order/:id

exports.deleteOrder = catchAsyncErrors( async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if(!order){
        return next( new ErrorHandler('Product not found by this ID.', 404));
    }

    await order.remove();

    res.status(200).json({
        success: true, 
    })
});