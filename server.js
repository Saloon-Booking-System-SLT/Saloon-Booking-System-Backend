const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require("path");
const { generalLimiter, apiLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Route imports
const salonRoutes = require("./routes/salonRoutes");
const serviceRoutes = require('./routes/serviceRoutes');
const professionalRoutes = require("./routes/professionalRoutes");
const timeSlotRoutes = require("./routes/timeSlotRouts");
const appointmentRoutes = require("./routes/appointmentRoutes");
const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require("./routes/feedbackRoutes");
const familybookingRoutes = require("./routes/familybookingRoutes");

// Initialize Express app
const app = express();

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS Configuration for production
const corsOptions = {
  origin: [
    'https://saloon-booking-system-frontend-web-one.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(generalLimiter); // Apply general rate limiting
app.use(express.json({ limit: "10mb" })); // handle JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // handle form data

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// API Routes with rate limiting
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/salons', apiLimiter, salonRoutes);          
app.use('/api/services', apiLimiter, serviceRoutes);
app.use('/api/professionals', apiLimiter, professionalRoutes);
app.use('/api/timeslots', apiLimiter, timeSlotRoutes);
app.use('/api/appointments', apiLimiter, appointmentRoutes);
app.use("/api/feedback", apiLimiter, feedbackRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/uploads/services", express.static(path.join(__dirname, "uploads/services")));
app.use("/uploads/professionals", express.static(path.join(__dirname, "uploads/professionals")));
app.use("/api/familybooking", apiLimiter, familybookingRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Salon API is running!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
