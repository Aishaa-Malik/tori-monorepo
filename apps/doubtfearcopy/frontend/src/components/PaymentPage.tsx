import React from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom'; 

const PaymentPage = () => { 
  const location = useLocation(); 
  const navigate = useNavigate(); 
  
  // Get data from navigation state 
  const { amount, plan } = location.state || { amount: 0, plan: 'No Plan Selected' }; 

  if (amount === 0) { 
    return <div className="p-10 text-center">Please select a plan first.</div>; 
  } 

  return ( 
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4"> 
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100"> 
        <button onClick={() => navigate(-1)} className="text-gray-400 mb-6 flex items-center gap-2"> 
          ← Back 
        </button> 
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Checkout</h2> 
        <p className="text-gray-500 mb-8">Securely complete your subscription for <strong>{plan}</strong></p> 

        {/* Amount Section */} 
        <div className="bg-orange-50 p-6 rounded-xl mb-8 flex justify-between items-center border border-orange-100"> 
          <div> 
            <p className="text-sm text-orange-600 font-semibold uppercase tracking-wider">Total Payable</p> 
            <p className="text-3xl font-black text-gray-900">₹{amount.toLocaleString()}</p> 
          </div> 
          <div className="text-right"> 
            <p className="text-xs text-gray-400">Incl. all taxes</p> 
          </div> 
        </div> 

        {/* Payment Methods (Mock) */} 
        <div className="space-y-4"> 
          <p className="font-bold text-gray-700">Select Payment Method</p> 
          
          <div className="flex items-center p-4 border rounded-xl cursor-pointer hover:border-red-500 transition border-red-500 bg-red-50"> 
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 border shadow-sm"> 
               📱 
            </div> 
            <div className="flex-1"> 
              <p className="font-bold">UPI</p> 
              <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p> 
            </div> 
            <input type="radio" checked readOnly className="accent-red-500" /> 
          </div> 

          <div className="flex items-center p-4 border rounded-xl cursor-pointer hover:border-red-500 transition border-gray-200"> 
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 border shadow-sm"> 
               💳 
            </div> 
            <div className="flex-1"> 
              <p className="font-bold">Credit / Debit Card</p> 
              <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p> 
            </div> 
            <input type="radio" className="accent-red-500" /> 
          </div> 
        </div> 

        {/* Final Action */} 
        <button 
          className="w-full mt-10 bg-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-red-600 transition" 
          onClick={() => alert(`Redirecting to bank for ₹${amount}...`)} 
        > 
          Pay ₹{amount.toLocaleString()} Now 
        </button> 
        
        <p className="mt-6 text-center text-xs text-gray-400 flex justify-center items-center gap-1"> 
          🔒 Secure SSL Encrypted Transaction 
        </p> 
      </div> 
    </div> 
  ); 
}; 

export default PaymentPage;