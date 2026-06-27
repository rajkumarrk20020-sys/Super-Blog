const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { xssClean, requestLogger } = require('./middleware/securityMiddleware');

// Load environment variables from the server folder regardless of the current working directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to Database
connectDB();

const app = express();

// Request logging
app.use(requestLogger);

// Secure headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Prevent NoSQL operator injection
app.use(mongoSanitize());

// Sanitize inputs
app.use(xssClean);

const allowedOrigins = [
  'http://localhost:5173',
  'https://super-blog-tqid-isd7sy3e1-superblog.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// CORS must be applied before routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mapping
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));

// Root endpoint for deployment sanity check
app.get('/', (req, res) => {
  res.send('SmartBlog Backend API is running...');
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend health check passed',
    timestamp: new Date().toISOString()
  });
});

// Custom error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
