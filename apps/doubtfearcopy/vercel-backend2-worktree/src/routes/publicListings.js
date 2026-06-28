const express = require('express');
const router = express.Router();
const publicListingsController = require('../controllers/publicListingsController');

router.get('/public-service-listings', publicListingsController.getPublicListings);
router.get('/public-service-listings/:serviceId', publicListingsController.getPublicListingById);

module.exports = router;
