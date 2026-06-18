import axios from 'axios';
import { getApiUrl } from '../utils/environmentUtils';

// Function to verify payment and update user role
export const verifyPaymentAndUpdateRole = async (
  paymentId: string,
  orderId: string,
  signature: string,
  email: string
) => {
  try {
    const response = await axios.post(`${getApiUrl()}/verify-payment`, {
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