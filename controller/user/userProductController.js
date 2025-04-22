const Product = require('../../model/productSchema');
const Category = require('../../model/categorySchema');

const getShopProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, brand, sort, error } = req.query;

        // Base query with isDeleted and status filters
        let query = { isDeleted: false, status: "Active" };

        // Apply search filter if provided
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Apply category filter based on description if provided
        if (category) {
            // Find categories with the matching description
            const matchingCategories = await Category.find({ description: category });
            if (matchingCategories.length > 0) {
                // Extract the category IDs
                const categoryIds = matchingCategories.map(cat => cat._id);
                // Filter products by these category IDs
                query.category = { $in: categoryIds };
            } else {
                // If no categories match the description, return no products
                query.category = null; // This ensures no products are returned
            }
        }

        // Apply price range filter if provided
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Apply brand filter if provided
        if (brand) {
            query.brand = brand;
        }

        // Define sort option based on query parameter
        let sortOption = {};
        if (sort === 'price-low-to-high') sortOption.price = 1;
        else if (sort === 'price-high-to-low') sortOption.price = -1;
        else if (sort === 'a-z') sortOption.name = 1;
        else if (sort === 'z-a') sortOption.name = -1;
        else if (sort === 'new-arrivals') sortOption.createdAt = -1;

        // Fetch products with the applied filters and sorting
        const products = await Product.find(query).sort(sortOption).populate('category');

        // Fetch all categories for the filter dropdown
        const categories = await Category.find();

        // Fetch unique brands from active products
        const brands = await Product.distinct('brand', { isDeleted: false, status: "Active" });

        // Render the shop.ejs template
        res.render('shop', {
            products,
            categories,
            brands,
            search: search || '',
            category: category || '',
            minPrice: minPrice || '',
            maxPrice: maxPrice || '',
            brand: brand || '',
            sort: sort || '',
            error: error || '',
            session: req.session // Add session
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

module.exports = { getShopProducts };