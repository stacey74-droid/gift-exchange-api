require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const eventRoutes = require("./routes/events");
const memberRoutes = require("./routes/members");
const wishlistRoutes = require("./routes/wishlist");
const multer = require('multer');
const path = require('path');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

console.log(process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log(err));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});

app.use(express.json({limit: '50mb'}));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE,PUT');
    next();
  });

  // Route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Gift Exchange API!');
});

app.options('/*', (_, res) => {
  res.sendStatus(200);
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/', // Folder to store images
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

app.use('/uploads', express.static('uploads')); // Serve static files

// Image upload route
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const imageUrl = `https://gift-exchange-api.onrender.com/${req.file.filename}`;
  res.json({ imageUrl });
});


app.use(eventRoutes);
app.use(memberRoutes);
app.use(wishlistRoutes);