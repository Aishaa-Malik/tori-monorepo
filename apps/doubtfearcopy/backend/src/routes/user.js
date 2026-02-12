const express = require('express');
const router = express.Router();
const { supabase } = require('../config');

// Middleware to validate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // For now, we'll extract user info from the token without full validation
  // In production, you should properly validate the JWT
  try {
    // Extract user info from token (this is a simplified approach)
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    
    // Log the token payload for debugging
    console.log('Token payload:', payload);
    
    // Handle different token formats (Supabase vs custom)
    req.user = {
      id: payload.sub || payload.user_id,
      email: payload.email
    };
    
    console.log('Extracted user info:', req.user);
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(403).json({ error: 'Invalid token format' });
  }
};

// Check onboarding status for authenticated user
router.get('/onboarding-status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    console.log('Checking onboarding status for user:', userEmail);

    // Check if user has completed onboarding
    const { data, error } = await supabase
      .from('business_profiles')
      .select('onboarding_completed')
      .eq('email', userEmail)
      .single();
    
    if (error) {
      console.error('Error checking onboarding status:', error);
      // If no profile exists, user needs onboarding
      return res.status(200).json({ 
        needsOnboarding: true,
        error: error.message
      });
    }
    
    console.log('Onboarding status data:', data);
    
    // If no profile exists or onboarding not completed, user needs onboarding
    const needsOnboarding = !data || !data.onboarding_completed;
    
    // Set proper content type header
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json({ 
      needsOnboarding,
      onboardingCompleted: data ? data.onboarding_completed : false
    });
    
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return res.status(500).json({ 
      error: 'Failed to check onboarding status',
      details: error.message
    });
  }
});

module.exports = router;