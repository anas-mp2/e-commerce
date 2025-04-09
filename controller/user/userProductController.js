const Product = require('../../model/productSchema');
const Category = require('../../model/categorySchema');

const getShopProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, brand, sort, error } = req.query;

       
        let query = { isDeleted: false, status: "Active" };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            
            const matchingCategories = await Category.find({ description: category });
            if (matchingCategories.length > 0) {
              
                const categoryIds = matchingCategories.map(cat => cat._id);
              
                query.category = { $in: categoryIds };
            } else {
             
                query.category = null; 
            }
        }

        
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (brand) {
            query.brand = brand;
        }

       
        let sortOption = {};
        if (sort === 'price-low-to-high') sortOption.price = 1;
        else if (sort === 'price-high-to-low') sortOption.price = -1;
        else if (sort === 'a-z') sortOption.name = 1;
        else if (sort === 'z-a') sortOption.name = -1;
        else if (sort === 'new-arrivals') sortOption.createdAt = -1;

       
        const products = await Product.find(query).sort(sortOption).populate('category');

    
        const categories = await Category.find();

        const brands = await Product.distinct('brand', { isDeleted: false, status: "Active" });

      
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
            error: error || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

module.exports = { getShopProducts };