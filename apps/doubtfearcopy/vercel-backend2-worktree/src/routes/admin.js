const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/onboard-business', adminController.onboardBusiness);

module.exports = router;
