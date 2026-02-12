import React from 'react';

const ContactUs: React.FC = () => {
  const WHATSAPP_CONTACT_URL = 'https://api.whatsapp.com/send/?phone=918619439126&text=Hi&type=phone_number&app_absent=0';

  return (
    <section className="relative min-h-screen flex items-center justify-center text-center text-white">
      <img src="/toriateBack.png" alt="Contact Background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-2xl px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="mt-4 text-lg text-gray-200">Have questions or want to get started? Reach us on WhatsApp.</p>
        <div className="mt-8">
          <a
            href={WHATSAPP_CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-full bg-white/10 border border-white/30 backdrop-blur hover:bg-white/20 transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
