import React from 'react';

const DeleteAccount = () => {
  const sections = [
    {
      title: "1. Right to Erasure",
      content: "Under applicable data protection laws, you have the right to request the deletion of your personal data associated with your TORI account."
    },
    {
      title: "2. How to Submit a Request",
      content: "To request the deletion of your account and associated data, please send an email to our support team at ash@toriate.com with the subject line 'Account Deletion Request'. Include the phone number or email address registered with your account."
    },
    {
      title: "3. What Happens Next?",
      content: "Once we receive your request, our team will verify your identity. We will then proceed to permanently erase your profile, booking history, and associated information from our active databases within 30 days."
    },
    {
      title: "4. Data Retention Exceptions",
      content: "Please note that we may retain certain data if required for legal, tax, or regulatory compliance purposes, or to resolve ongoing disputes."
    },
    {
      title: "5. Third-Party Services",
      content: "If you booked services through a specific business on TORI, that business may still hold records of your appointments. You will need to contact them directly to delete data from their independent systems."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-gray-800">
      <header className="border-b pb-8 mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Data Deletion Request</h1>
        <p className="text-gray-500">How to remove your account and personal data from TORI</p>
      </header>

      <section className="mb-10">
        <p className="text-lg leading-relaxed">
          At TORI, we believe you should have complete control over your personal data. 
          If you no longer wish to use our services, you can easily request that your account 
          and all associated booking data be permanently removed from our systems.
        </p>
      </section>

      <div className="space-y-8">
        {sections.map((item, index) => (
          <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold mb-3">{item.title}</h2>
            <p className="text-gray-700 leading-snug">{item.content}</p>
          </div>
        ))}
      </div>

      <footer className="mt-12 pt-8 border-t text-center text-gray-500 italic">
        <p>Built by TORI - The Amazon of Booking.</p>
      </footer>
    </div>
  );
};

export default DeleteAccount;