const Product = require('../models/product');
const dotenv = require('dotenv');

const connectDatabase = require('../config/database');

const products = require('../data/products.json')

// Settinf dotenv file 
dotenv.config({ path: 'backend/config/config.env' });

connectDatabase();

const seedProdcucts = async () => {
    try {

        await Product.deleteMany();
        console.log('Old products are deleted');
        console.log('creating new Products');

        await Product.insertMany(products);
        console.log('New Products are added.');

    } catch(error){
        console.log(error.message);
    }
    process.exit();
}

seedProdcucts()