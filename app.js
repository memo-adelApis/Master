const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
// Routes
const mountRoutes = require('./routes');
const { webhookCheckout } = require('./services/orderService');


// express app
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options('*', cors());

// compress all responses
app.use(compression());

// Checkout webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes(app);

app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);
module.exports = app;
