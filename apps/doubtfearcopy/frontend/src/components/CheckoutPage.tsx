import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowLeft, CreditCard, Lock, CheckCircle, Calendar, Clock, User, Phone, ArrowRight } from 'lucide-react';
import axios from 'axios';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage: React.FC = () => {
  const { cartItems, removeFromCart, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please fill in your details.');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Create Order
      const { data } = await axios.post('http://localhost:5001/api/create-order', {
        amount: totalAmount,
        currency: 'INR'
      });

      if (!data.success) throw new Error('Order creation failed');

      // 2. Initialize Razorpay
      const options = {
        key: 'rzp_live_S3MicoHBoS9C24', // Live Key ID
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Tori',
        description: 'Service Booking',
        image: '/logo1.png',
        order_id: data.order.id,
        handler: function (response: any) {
           // Handle success - In a real app, verify signature here
           alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
           clearCart();
           // Redirect to success page or orders
           navigate('/'); 
        },
        prefill: {
          name: name,
          contact: phone,
        },
        theme: {
          color: '#0d9488', // Teal-600
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error: any) {
      console.error('Payment Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Payment initialization failed: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
     // Empty State
     return (
       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
         <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
           <CreditCard className="w-10 h-10 text-teal-600" />
         </div>
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
         <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added any services yet. Explore our services to find what you need.</p>
         <Link to="/services" className="px-8 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors inline-flex items-center gap-2">
           <ArrowLeft className="w-4 h-4" />
           Browse Services
         </Link>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
           <Link to="/" className="flex items-center gap-3">
             <img src="/logo1.png" alt="Tori" className="w-8 h-8 rounded-lg shadow-sm" />
             <span className="font-bold text-xl tracking-tight text-gray-900">Tori</span>
           </Link>
           <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
             <Lock className="w-3 h-3" />
             <span className="font-medium">Secure Checkout</span>
           </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
           {/* Left: Cart Items */}
           <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                <span className="text-sm text-gray-500">{cartItems.length} items</span>
             </div>
             
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               {cartItems.map((item, index) => (
                 <div key={index} className="p-6 border-b border-gray-100 last:border-0 flex gap-6 hover:bg-gray-50/50 transition-colors">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden shadow-inner">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                        <button onClick={() => removeFromCart(index)} className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-teal-600 font-bold text-lg mb-4">{item.price}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                          <Calendar className="w-4 h-4 text-teal-500" />
                          <span className="font-medium">{item.date}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                          <Clock className="w-4 h-4 text-teal-500" />
                          <span className="font-medium">{item.time}</span>
                        </div>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
             
             <Link to="/services" className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700 hover:underline">
               <ArrowLeft className="w-4 h-4 mr-2" />
               Add more services
             </Link>
           </div>

           {/* Right: Details & Payment */}
           <div className="lg:col-span-1">
             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-24">
               <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <User className="w-5 h-5 text-teal-600" />
                 Patient Details
               </h3>
               
               <form onSubmit={handlePayment} className="space-y-5">
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
                   <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input 
                       type="text" 
                       required
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none font-medium text-gray-900"
                       placeholder="Enter your name"
                     />
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone Number</label>
                   <div className="relative">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                     <input 
                       type="tel" 
                       required
                       value={phone}
                       onChange={(e) => setPhone(e.target.value)}
                       className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none font-medium text-gray-900"
                       placeholder="Enter phone number"
                     />
                   </div>
                 </div>

                 <div className="pt-6 border-t border-gray-100 mt-6 space-y-3">
                   <div className="flex justify-between text-gray-600">
                     <span>Subtotal</span>
                     <span>₹{totalAmount}</span>
                   </div>
                   <div className="flex justify-between text-gray-600">
                     <span>Taxes & Fees</span>
                     <span>₹0</span>
                   </div>
                   <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-gray-100 border-dashed">
                     <span>Total</span>
                     <span>₹{totalAmount}</span>
                   </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={loading}
                   className="w-full mt-6 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-800 hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                 >
                   {loading ? (
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                   ) : (
                     <>
                       <span>Pay Now</span>
                       <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </>
                   )}
                 </button>
                 
                 <div className="flex items-center justify-center gap-2 mt-4 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                   <img src="https://cdn.razorpay.com/static/assets/merchant-badge/badge-dark.png" alt="Razorpay" className="h-8" />
                 </div>
               </form>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;