import React from 'react';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. Scope & Consent",
      content: "By using TORI to book appointments via WhatsApp, you agree to the collection and use of information in accordance with this policy."
    },
    {
      title: "2. Information We Collect",
      content: "We collect your WhatsApp phone number, name, and specific booking requirements (e.g., healthcare needs, session times) to facilitate seamless scheduling."
    },
    {
      title: "3. How We Use Data",
      content: "Data is used to cut booking time by 90%, send automated reminders to reduce no-shows, and provide real-time updates to service providers."
    },
    {
      title: "4. Data Sharing",
      content: "Your information is shared strictly with the professional or business you are booking with. We do not sell user data to third parties."
    },
    {
      title: "5. Security & WhatsApp",
      content: "TORI leverages WhatsApp’s secure infrastructure. While we provide a comprehensive admin dashboard for businesses, your chat data remains encrypted via Meta’s protocols."
    },
    {
      title: "6. User Control",
      content: "You may request data deletion at any time. Since TORI is built on WhatsApp, you maintain full control over your messaging interactions."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-gray-800">
      <header className="border-b pb-8 mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">TORI Privacy Policy</h1>
        <p className="text-gray-500">Last Updated: December 2025</p>
      </header>

      <section className="mb-10">
        <p className="text-lg leading-relaxed">
          TORI is committed to providing the simplest and fastest booking experience while 
          respecting your privacy. This policy outlines our commitment to protecting your data 
          across all industries, from healthcare to fitness.
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

export default PrivacyPolicy;