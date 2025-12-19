const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/webar_app';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        const conn = mongoose.connection;
        console.log(`MongoDB Connected: ${conn.host}`);
        console.log(`Database Name: ${conn.name}`);

        // List collections to verify data presence
        conn.db.listCollections().toArray()
            .then(cols => {
                const colNames = cols.map(c => c.name);
                console.log('Available Collections:', colNames);
                if (colNames.includes('products')) {
                    conn.db.collection('products').countDocuments()
                        .then(count => console.log(`Documents in 'products' collection: ${count}`))
                        .catch(err => console.error('Error counting documents:', err));
                }
            })
            .catch(err => console.error('Error listing collections:', err));
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('WebAR Backend is running');
});

// Import Routes
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
