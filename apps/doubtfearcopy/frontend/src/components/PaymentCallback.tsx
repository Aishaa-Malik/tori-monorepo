import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';

// Use Vercel backend URL
const BACKEND_API_URL = 'https://vercel-backend2-qj8e.vercel.app/api';

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get the email from localStorage
        const email = localStorage.getItem('paymentEmail');
        
        if (!email) {
          setStatus('error');
          setMessage('Email information not found. Please try again or contact support.');
          return;
        }

        // Get payment details from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const razorpay_payment_id = searchParams.get('razorpay_payment_id');
        const razorpay_order_id = searchParams.get('razorpay_order_id');
        const razorpay_signature = searchParams.get('razorpay_signature');
        
        // Extract plan information from URL notes or localStorage
        let plan = 'basic'; // Default plan
        const planFromNotes = searchParams.get('notes[plan]');
        if (planFromNotes) {
          plan = planFromNotes;
        } else {
          // Fallback: try to get plan from localStorage if not in URL
          const storedPlan = localStorage.getItem('selectedPlan');
          if (storedPlan) {
            plan = storedPlan;
          }
        }
        
        // Log payment parameters for debugging
        console.log('Payment callback parameters:', { 
          razorpay_payment_id, 
          razorpay_order_id, 
          razorpay_signature,
          email,
          plan
        });

        // For testing purposes - if no payment details are in URL, we'll still process the payment
        // This allows us to test the flow without actual Razorpay integration
        const paymentData = {
          razorpay_payment_id: razorpay_payment_id || 'test_payment_' + Date.now(),
          razorpay_order_id: razorpay_order_id || 'test_order_' + Date.now(),
          razorpay_signature: razorpay_signature || 'test_signature_' + Date.now(),
          email,
          plan
        };

        console.log('Sending payment verification request:', paymentData);

        // Call backend API to verify payment
        const response = await axios.post(`${BACKEND_API_URL}/verify-payment`, paymentData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Payment verification response:', response.data);

        if (response.data.success) {
          handleSuccessfulPayment(response.data);
        } else {
          handleFailedPayment(response.data.message || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment callback error:', error);
        console.log('Full error object:', JSON.stringify(error, null, 2));
        if (error.response) {
          console.log('Response data:', error.response.data);
          console.log('Response status:', error.response.status);
          console.log('Response headers:', error.response.headers);
        }
        handleFailedPayment(error.response?.data?.message || 'An error occurred while processing your payment');
      }
    };

    const handleSuccessfulPayment = async (responseData: any) => {
      setStatus('success');
      const planName = responseData.plan ? responseData.plan.charAt(0).toUpperCase() + responseData.plan.slice(1) : 'Basic';
      setMessage(`Payment successful! You are now registered as a Business Admin with the ${planName} plan. Please log in to complete your setup.`);
      
      // Clear the email and plan from localStorage
      localStorage.removeItem('paymentEmail');
      localStorage.removeItem('selectedPlan');
      
      // Store a flag to indicate successful payment for login redirect
      localStorage.setItem('paymentCompleted', 'true');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
      // Log success for debugging
      console.log('Payment processed successfully, redirecting to login');
    };

    const handleFailedPayment = (errorMessage: string) => {
      setStatus('error');
      setMessage(errorMessage || 'Payment verification failed. Please contact support.');
      console.log('Payment failed with error:', errorMessage);
    };

    processPayment();
  }, [navigate, location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Payment {status === 'processing' ? 'Processing' : status === 'success' ? 'Successful' : 'Failed'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            )}
            
            {status === 'success' && (
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            
            <p className="mt-4 text-sm text-gray-600">{message}</p>
            
            {status === 'error' && (
              <div className="mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;