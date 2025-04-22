const Product = require('../../model/productSchema');
const Category = require('../../model/categorySchema');
const path = require('path');
const fs = require('fs');
const { upload, processImages } = require('../../middleware/multerConfig');

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false })
            .populate('category'); // Populate the category field
        res.render('admin-product', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Render add product page
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
            description, // Added description
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

// Render edit product page
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

// Update product
const editProduct = [
    // Validation middleware here
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const { name, description, brand, price, stock, status, category, deletedImages } = req.body;

            const product = await Product.findById(id);
            if (!product) return res.status(404).json({ message: 'Product not found' });

            // Update product fields
            product.name = name;
            product.description = description;
            product.brand = brand;
            product.price = price;
            product.stock = stock;
            product.status = status;
            product.category = category;

            // Handle new images
            if (req.files && req.files.length > 0) {
                // Process new images (e.g., using multer and sharp as before)
                product.images = req.files.map(file => file.path);
            }

            // Handle deleted images
            if (deletedImages) {
                const deletedImageUrls = deletedImages.split(',');
                for (const imageUrl of deletedImageUrls) {
                    const filePath = path.join(__dirname, '..', 'public', imageUrl.replace('/uploads/', ''));
                    await fs.unlink(filePath).catch(err => console.log(`Failed to delete ${filePath}:`, err));
                    product.images = product.images.filter(img => img !== imageUrl);
                }
            }

            await product.save();
            res.redirect('/admin/products');
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }
];
// Soft delete product
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