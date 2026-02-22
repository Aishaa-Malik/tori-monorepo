import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LandingPage3: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const WHATSAPP_BOOK_URL = 'https://api.whatsapp.com/send/?phone=919351504729&text=Hi&type=phone_number&app_absent=0';

  const services = [
    {
      title: 'Doctors',
      description:
        'Book doctor consultations instantly over WhatsApp — no apps, no OTPs.',
      cta: 'Check-in',
    },
    {
      title: 'Healthcare Centres',
      description:
        'Schedule visits, tests, and checkups with healthcare centers in seconds.',
      cta: 'Check-in',
    },
    {
      title: 'Physiotherapy',
      description:
        'Reserve physiotherapy sessions seamlessly with reminders handled by TORI.',
      cta: 'Check-in',
    },
    {
      title: 'Mental Health',
      description:
        'Book therapy and counseling with ease and privacy via WhatsApp.',
      cta: 'Check-in',
    },
    {
      title: 'Forest & Health Retreats',
      description:
        'Plan wellness and nature immersion retreats in just 4 messages.',
      cta: 'Check-in',
    },
    {
      title: 'Salons',
      description:
        'Book salon appointments quickly — frictionless and customer-friendly.',
      cta: 'Check-in',
    },
    {
      title: 'Gyms',
      description:
        'Reserve classes or personal training sessions instantly on WhatsApp.',
      cta: 'Check-in',
    },
    {
      title: 'Law Consultancy',
      description:
        'Schedule legal consultations effortlessly, with confirmations and reminders.',
      cta: 'Check-in',
    },
    {
      title: 'Sports Venues (Football Turfs)',
      description:
        'Book turf and sports venue slots in 10 seconds — no forms.',
      cta: 'Check-in',
    },
    {
      title: 'Restaurants',
      description:
        'Reserve tables with one WhatsApp message — simple and fast.',
      cta: 'Check-in',
    },
    {
      title: 'Spas',
      description:
        'Book spa treatments seamlessly with automated reminders and updates.',
      cta: 'Check-in',
    },
    {
      title: 'Events',
      description:
        'RSVP or book event tickets with a single WhatsApp chat.',
      cta: 'Check-in',
    },
    {
      title: 'Passport/VISA Interviews',
      description:
        'Get assistance booking interview slots — fast, guided, and reliable.',
      cta: 'Check-in',
    },
  ];

  const visibleCards = [0, 1, 2].map((i) => services[(currentCardIndex + i) % services.length]);

  return (
    <>
      {/* Simple sticky nav using Tailwind */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-black/50 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <img src="/logo1.png" alt="Logo" className="h-12 w-12 rounded" />
            <span className="text-sm uppercase tracking-wide">Tori</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/about" className="text-sm text-gray-200 hover:text-white">About Us</Link>
            <Link to="/contact" className="text-sm text-gray-200 hover:text-white">Contact Us</Link>
            <Link to="/services" className="text-sm px-3 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition">SEE ALL SERVICES</Link>
          </nav>
        </div>
      </header>

      <div className="pt-14">
        {/* HERO SECTION (Image 1) */}
        <section className="relative min-h-screen flex items-center justify-center text-center text-white">
          {/* Background image + overlay */}
          <img src="/toriateBack.png" alt="Forest Retreats" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />

          <div className="absolute top-6 left-6 z-10 hidden md:flex items-center gap-3">
            <img src="/logo1.png" alt="Logo" className="h-12 w-12 rounded" />
            <span className="text-sm uppercase tracking-wide">Tori</span>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-5xl px-6">
            <img
              src="/logo1.png"
              alt="Tori logo"
              className="mx-auto h-44 w-44 rounded mb-6"
            />
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">TORI — THE PAYTM OF BOOKING</h1>
            <p className="mt-6 text-lg md:text-xl text-yellow-200">
             like for PAYMENT PAYTM is the SIMPLEST & FASTEST METHOD for people, similarly for BOOKING anything or scheduling appointment- TORI is the MOST SIMPLEST & FASTEST METHOD OF BOOKING

            </p>
            <div className="mt-8">
              <a
                href="https://api.whatsapp.com/send/?phone=919351504729&text=Hi&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full bg-white/10 border border-white/30 backdrop-blur hover:bg-white/20 transition"
              >
                Try TORI TO BOOK ANY SERVICE IN 10 SEC
              </a>
            </div>
          </div>
        </section>

        {/* SECOND SECTION (Image 2) */}
        <section className="relative min-h-screen flex items-center justify-center text-center text-white">
          <img src="/yello.png" alt="Know Yourself" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 max-w-3xl px-6">
            <h2 className="text-3xl md:text-5xl font-bold">TORI enables seamless booking over WhatsApp chat in just 10 seconds</h2>
            <p className="mt-6 text-base md:text-lg text-gray-200">
NO TIME WASTAGE IN Downloading ANY 3rd party Apps required by You or Your Customers, NO sign‑up, OTP that’ll IRRITATE them to DROP BOOKING YOUR session</p>
            <div className="mt-8">
              <a
                href="https://api.whatsapp.com/send/?phone=919351504729&text=Hi&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full bg-white/10 border border-white/30 hover:bg-white/20 transition"
              >
                Try Tori to book any service ON WHATSAPP BY CHATTING
              </a>
            </div>
          </div>
        </section>

        {/* CONTENT COPY (TORI story) */}
        <section
          className="relative text-gray-900 py-16"
          style={{
            backgroundImage: "url(/toriateBack.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative max-w-6xl mx-auto px-6">
            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8">Why TORI</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-2xl p-6 shadow-xl text-white border border-white/20 backdrop-blur-md bg-pink-300/20">
                <p className="text-sm md:text-base">
                   Customers
                prefer messaging but are forced into outdated booking systems — lengthy forms, searching on 3rd-party
                  websites, waiting for apps to download, sign-ups, OTPs, and phone calls.
                </p>
              </div>
              <div className="rounded-2xl p-6 shadow-xl text-white border border-white/20 backdrop-blur-md bg-yellow-300/20">
                <p className="text-sm md:text-base">
                 
WITH OUR AI BOOKING

Bookings work ANY-TIME, not just your business hrs

                </p>
              </div>
              <div className="rounded-2xl p-6 shadow-xl text-white border border-white/20 backdrop-blur-md bg-sky-300/20">
                <p className="text-sm md:text-base">
                 Customers will book YOUR SESSION on Whatsapp chat- AUTOMATED & Managed By our AI

                </p>
              </div>
              <div className="rounded-2xl p-6 shadow-xl text-white border border-white/20 backdrop-blur-md bg-orange-300/20">
                <p className="text-sm md:text-base">
                  With TORI, booking drop-offs reduce, booking time is cut by 90%, and no-shows decrease via automated WhatsApp reminders.
                  
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* THIRD SECTION (Image 3 with cards) */}
        <section
          id="features-cards"
          className="relative py-16 text-white"
          style={{
            backgroundImage: 'url(/yello.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-semibold">Our Services</h3>
              <div className="flex items-center gap-3">
                <button
                  aria-label="Previous"
                  className="p-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20"
                  onClick={() => setCurrentCardIndex((currentCardIndex - 1 + services.length) % services.length)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  aria-label="Next"
                  className="p-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20"
                  onClick={() => setCurrentCardIndex((currentCardIndex + 1) % services.length)}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleCards.map((svc, idx) => (
                <div key={`${svc.title}-${idx}`} className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur">
                  <div className="mb-3 text-teal-300 text-sm uppercase tracking-wide">Service</div>
                  <h4 className="text-2xl font-bold tracking-wide">{svc.title}</h4>
                  <p className="mt-3 text-base md:text-lg text-gray-100 font-medium leading-relaxed">{svc.description}</p>
                  <a
                    href={WHATSAPP_BOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-teal-300 hover:text-teal-200 underline font-semibold text-lg"
                  >
                    {svc.cta}
                  </a>
                </div>
              ))}
            </div>

            {/* Back link */}
            <div className="mt-8 text-center">
              <a href="#" className="text-gray-300 hover:text-gray-200">back</a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default LandingPage3;
