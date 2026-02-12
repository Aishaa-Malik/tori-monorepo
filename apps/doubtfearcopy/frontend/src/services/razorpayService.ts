import axios from 'axios';

// Use local backend for development and testing
const BACKEND_API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001/api' 
  : 'https://vercel-backend2-qj8e.vercel.app/api';

// Function to verify payment and update user role
export const verifyPaymentAndUpdateRole = async (
  paymentId: string,
  orderId: string,
  signature: string,
  email: string
) => {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/verify-payment`, {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature,
      email
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};