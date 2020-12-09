var express = require('express');
var router = express.Router();
var fs = require('fs-extra');

var Product = require('../models/product');
var Category = require('../models/category');

router.use(express.static(__dirname + '/public'));

router.get('/', function (req, res){

    Product.find(function (err, products){
        if (err)
            console.log(err);

        res.render('all_products', {
            title: 'All products',
            products:  products
        });
    });
});

router.get('/:category', function (req, res){

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, function (err, c) {
        Product.find({category: categorySlug}, function (err, products){
            if (err)
                console.log(err);
    
            res.render('cat_products', {
                title: c.title,
                products:  products
            });
        });
    });
});

router.get('/:category/:product', function (req, res){

    var galleryImages = null;

    Product.findOne({slug: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if (err){
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages
                    });
                }
            });
        }
    });
});

module.exports = router;