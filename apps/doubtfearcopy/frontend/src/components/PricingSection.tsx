import React, { useState } from 'react';
import { verifyPaymentAndUpdateRole } from '../services/razorpayService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9,
    features: [
      'WhatsApp appointment booking',
      'Basic dashboard',
      'Up to 100 appointments/month',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 13,
    features: [
      'All Basic features',
      'Advanced analytics',
      'Up to 500 appointments/month',
      'Priority email support',
      'Custom branding'
    ],
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 19,
    features: [
      'All Professional features',
      'Unlimited appointments',
      '24/7 phone support',
      'Dedicated account manager',
      'API access',
      'Custom integrations'
    ]
  }
];

const PricingSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setShowEmailForm(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) return;
    
    try {
      setIsProcessing(true);
      setErrorMessage('');
      
      // Store the email and selected plan in localStorage for later verification
      localStorage.setItem('paymentEmail', email);
      localStorage.setItem('selectedPlan', selectedPlan.id);
      
      const baseUrl = 'https://rzp.io/rzp/WYPXJsZt';          // your Payment-Page link
      
      // Use appropriate callback URL based on environment
      let callbackUrl = 'https://vercel-frontend2-taupe.vercel.app/payment-callback';
      
      if (process.env.NODE_ENV === 'development') {
        callbackUrl = 'http://localhost:3000/payment-callback';
      } else if (window.location.hostname.includes('toriate.com')) {
        callbackUrl = 'https://toriate.com/payment-callback';
      } else if (window.location.hostname.includes('vercel-frontend2-git-main-aishafaang-gmailcoms-projects.vercel.app')) {
        callbackUrl = 'https://vercel-frontend2-git-main-aishafaang-gmailcoms-projects.vercel.app/payment-callback';
      }
        
      const callback = encodeURIComponent(callbackUrl);

      const url = `${baseUrl}?redirect=${callback}` +
                  `&prefill[email]=${encodeURIComponent(email)}` +
                  `&notes[plan]=${selectedPlan.id}`;

      window.location.href = url;

      setPaymentStatus('idle');
      localStorage.setItem('paymentInitiated', 'true');
      setIsProcessing(false);         

      
      // Redirect directly to the Razorpay payment link
      // After payment, the user will be redirected back to our site
      // We'll use a URL parameter to track the return URL
     //const returnUrl = encodeURIComponent(window.location.origin + '/payment-callback');
      
      // In a real implementation, you would append the return URL to your Razorpay link
      // For example: https://rzp.io/rzp/WYPXJsZt?callback=${returnUrl}
      // For now, we'll use the direct link as specified
     // window.location.href = "https://rzp.io/rzp/WYPXJsZt";
      
      // Note: The verification and role update will need to be handled 
      // when the user returns from the payment page, likely in a callback route
      
    } catch (error) {
      console.error('Payment redirection failed:', error);
      setPaymentStatus('error');
      setErrorMessage('Failed to redirect to payment page. Please try again later.');
      setIsProcessing(false);
    }
  };
  
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Choose the right plan for your practice
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Start streamlining your appointment booking process today with our affordable plans
          </p>
        </div>

        {paymentStatus === 'success' ? (
          <div className="mt-12 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> Payment completed successfully. You are now registered as a Business Admin.</span>
            <p className="mt-2">Redirecting to dashboard...</p>
          </div>
        ) : paymentStatus === 'error' ? (
          <div className="mt-12 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {errorMessage || 'Something went wrong. Please try again.'}</span>
          </div>
        ) : showEmailForm && selectedPlan ? (
          <div className="mt-12 max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-900">Complete your purchase</h3>
            <p className="mt-2 text-gray-600">You're purchasing the {selectedPlan.name} plan at ${selectedPlan.price}</p>
            
            <form onSubmit={handleEmailSubmit} className="mt-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isProcessing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Plans
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${
                  plan.isPopular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0 px-4 py-1 bg-blue-500 rounded-full text-xs font-semibold text-white tracking-wide uppercase">
                    Most Popular
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                    <span className="ml-1 text-xl font-semibold">/month</span>
                  </p>
                  
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex">
                        <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-3 text-base text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md shadow text-center text-sm font-medium ${
                    plan.isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Pay Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingSection;