const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create product
router.post('/', upload.fields([{ name: 'model', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, category } = req.body;

        if (!req.files || !req.files['model'] || !req.files['thumbnail']) {
            return res.status(400).json({ message: 'Both model and thumbnail files are required.' });
        }

        const modelFile = req.files['model'][0];
        const thumbnailFile = req.files['thumbnail'][0];

        const modelUrl = `/uploads/${modelFile.filename}`;
        const thumbnailUrl = `/uploads/${thumbnailFile.filename}`;

        const newProduct = new Product({
            name,
            category,
            modelUrl,
            thumbnailUrl
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Delete files
        const modelPath = path.join(__dirname, '..', 'public', product.modelUrl);
        const thumbnailPath = path.join(__dirname, '..', 'public', product.thumbnailUrl);

        if (fs.existsSync(modelPath)) fs.unlinkSync(modelPath);
        if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
