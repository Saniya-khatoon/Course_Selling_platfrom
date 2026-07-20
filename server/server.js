// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(express.json());
// app.use(cors());

// // IMPORTANT: Make sure the name here matches your .env file
// // You used MONGO_URL in your photo, so use that!
// const mongoURI = process.env.MONGO_URL; 

// console.log("Connectinng to: ", process.env.MONGO_URL);

// mongoose.connect(mongoURI)
//   .then(() => {
//     console.log("✅ ✅ ✅ MONGODB CONNECTED SUCCESSFULLY! ✅ ✅ ✅");
//   })
//   .catch((err) => {
//     console.log("❌ DATABASE CONNECTION ERROR:", err);
//   });

// app.get('/', (req, res) => {
//   res.send("API is working!");
// });

// // const cors = require('cors');
// // app.use(cors()); 

// // Import Routes
// const authRoutes = require('./routes/auth.js');

// // Use Routes
// app.use('/api/auth', authRoutes);

// app.use('/api/courses', require('./routes/courses'));

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server started on http://localhost:${PORT}`);
// });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// MongoDB Connection
const mongoURI = process.env.MONGO_URL;

console.log("Connecting to:", mongoURI);

mongoose.connect(mongoURI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
  })
  .catch((err) => {
    console.log("❌ Database Connection Error:", err);
  });

// Test Route
app.get('/', (req, res) => {
  res.send("API is working!");
});

// Import Routes
const authRoutes = require('./routes/auth.js');
const courseRoutes = require('./routes/courses');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Server Port
const PORT = process.env.PORT || 5000;

// IMPORTANT CHANGE
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});