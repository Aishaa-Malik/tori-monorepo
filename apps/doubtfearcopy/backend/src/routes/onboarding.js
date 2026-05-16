const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');

// Check if a user needs onboarding
router.get('/check-onboarding', onboardingController.checkOnboardingStatus);

// Public service listings
router.get('/public-service-listings', onboardingController.getPublicServiceListings);
router.get('/public-service-listings/:serviceId', onboardingController.getPublicServiceListingById);

// Save onboarding data
router.post('/save-onboarding', onboardingController.saveOnboardingData);

// Get onboarding data
router.get('/get-onboarding', onboardingController.getOnboardingData);

module.exports = router;
