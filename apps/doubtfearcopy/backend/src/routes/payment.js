const express = require('express');
const router = express.Router();
const { verifyPayment, createOrder } = require('../controllers/paymentController');

// Create order route
router.post('/create-order', createOrder);

// Payment verification route
router.post('/verify-payment', verifyPayment);

module.exports = router;