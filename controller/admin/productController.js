const Product = require('../../model/productSchema');
const Category = require('../../model/categorySchema');
const path = require('path');
const fs = require('fs');
const { upload, processImages } = require('../../middlewares/multerConfig');

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false })
            .populate('category'); 
        res.render('admin-product', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

const getAddProduct = async (req, res) => {
    try {
        const categories = await Category.find({ isDeleted: false });
        res.render('add-product', { 
            categories,
            message: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

const addProduct = async (req, res) => {
    try {
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);
        const { name, description, brand, price, stock, category, status } = req.body;

        if (!stock || isNaN(stock)) {
            const categories = await Category.find({ isDeleted: false });
            return res.render('add-product', {
                categories,
                message: 'Stock is required and must be a valid number'
            });
        }

        if (!req.files || req.files.length < 3) {
            const categories = await Category.find({ isDeleted: false });
            return res.render('add-product', {
                categories,
                message: 'Please upload at least 3 images'
            });
        }

        const categoryDoc = await Category.findById(category);
        console.log('Category found:', categoryDoc);
        if (!categoryDoc) {
            const categories = await Category.find({ isDeleted: false });
            return res.render('add-product', {
                categories,
                message: 'Selected category not found'
            });
        }

        const processedImagePaths = await processImages(req.files);
        console.log('Processed image paths:', processedImagePaths);

        const product = new Product({
            name,
            description, 
            brand,
            price: parseFloat(price),
            stock: parseInt(stock, 10),
            category: categoryDoc._id,
            status,
            images: processedImagePaths
        });

        console.log('Product to save:', product);
        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Add product error:', error.message, error.stack);
        const categories = await Category.find({ isDeleted: false });
        res.status(500).render('add-product', {
            categories,
            message: `An error occurred while adding the product: ${error.message}. Please try again.`
        });
    }
};

const getEditProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const categories = await Category.find();
        res.render('edit-product', {
            product,
            categories,
            message: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

const editProduct = async (req, res) => {
    try {
        const { name, description, brand, price, stock, status, category, imagesToDelete } = req.body; 
        const product = await Product.findById(req.params.id);
        const imagesToDeleteArray = imagesToDelete ? JSON.parse(imagesToDelete) : [];

        if (!product) {
            return res.status(404).send('Product not found');
        }

        if (!name || !brand || !price || !stock || !status || !category) {
            const categories = await Category.find();
            return res.render('edit-product', {
                product,
                categories,
                message: 'All fields except description are required'
            });
        }

        product.name = name;
        product.description = description || product.description; 
        product.brand = brand;
        product.price = parseFloat(price);
        product.stock = parseInt(stock, 10); 
        product.status = status;
        product.category = category;

        // Handle image deletion
        if (imagesToDeleteArray.length > 0) {
            imagesToDeleteArray.forEach(image => {
                const imagePath = path.join(__dirname, '../../public', image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
                product.images = product.images.filter(img => img !== image);
            });
        }

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            if (req.files.length < 3) {
                const categories = await Category.find();
                return res.render('edit-product', {
                    product,
                    categories,
                    message: 'Please upload at least 3 images if updating images'
                });
            }

            const processedImagePaths = await processImages(req.files);
            if (!processedImagePaths || processedImagePaths.length === 0) {
                throw new Error('Image processing failed');
            }
            product.images = [...product.images, ...processedImagePaths];
        }

        // Ensure minimum 3 images after all operations
        if (product.images.length < 3) {
            const categories = await Category.find();
            return res.render('edit-product', {
                product,
                categories,
                message: 'Product must have at least 3 images'
            });
        }

        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Edit product error:', error.message, error.stack);
        const categories = await Category.find();
        res.status(500).render('edit-product', {
            product: await Product.findById(req.params.id) || {},
            categories,
            message: `An error occurred while updating the product: ${error.message}. Please try again.`
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.redirect('/admin/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getProducts,
    deleteProduct,
    editProduct,
    getEditProduct,
    addProduct,
    getAddProduct
};