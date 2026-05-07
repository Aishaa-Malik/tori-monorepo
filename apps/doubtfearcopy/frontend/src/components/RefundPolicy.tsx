import React from 'react';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 md:p-16 lg:p-24">
      <header className="mb-12 border-b pb-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Refund & Cancellation Policy</h1>
        <p className="text-gray-500">Last Updated: December 2025</p>
      </header>

      <section className="mb-10 space-y-6">
        <p className="text-lg leading-relaxed">
          At TORI, we act solely as a technology platform connecting customers with service providers. 
          Therefore, we do not directly process refunds for the services booked through our platform.
        </p>
        <p className="text-lg leading-relaxed font-semibold text-red-600">
          We aren't responsible for any dispute, please contact the service provider with which you booked the service.
        </p>
      </section>

      <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-3">1. Dispute Resolution</h2>
          <p className="text-gray-700 leading-snug">
            Any disputes regarding service quality, cancellations, or refund requests must be handled 
            directly with the respective service provider. TORI holds no liability for unfulfilled 
            services or dissatisfaction.
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold mb-3">2. Cancellations</h2>
          <p className="text-gray-700 leading-snug">
            Cancellation policies are determined by the individual service providers. Please review 
            their specific terms before making a booking.
          </p>
        </div>
      </div>

      <footer className="mt-12 pt-8 border-t text-center text-gray-500 italic">
        <p>Built by TORI.</p>
      </footer>
    </div>
  );
};

export default RefundPolicy;
