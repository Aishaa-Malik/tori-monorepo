import React from 'react';

const ContactUs: React.FC = () => {
  const WHATSAPP_URL =
    'https://api.whatsapp.com/send/?phone=918619439126&text=Hi&type=phone_number&app_absent=0';

  const contacts = [
    
    {
      label: 'Email',
      value: 'torieate@gmail.com',
      href: 'mailto:torieate@gmail.com',
      external: false,
    },
    {
      label: 'WhatsApp',
      value: '+91 86194 39126',
      href: WHATSAPP_URL,
      external: true,
    },
    {
      label: 'Location',
      value: 'Jaipur, Rajasthan',
      href: 'https://maps.google.com/?q=Jaipur',
      external: true,
    },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0d0c0c] flex items-center justify-center">

      {/* ── Background Image ── */}
      <img
        src="/toriateBack.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        style={{ filter: 'brightness(0.32) saturate(0.75)' }}
      />

      {/* ── Radial top overlay (text readability) ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] pointer-events-none z-[1]"
        style={{
          height: '65vh',
          background:
            'radial-gradient(ellipse at center top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.15) 60%, transparent 100%)',
        }}
      />

      {/* ── Blue gradient bottom (matches hero) ── */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none z-[2]"
        style={{
          height: '60svh',
          background:
            'linear-gradient(to top, rgba(0,140,255,0.38) 0%, rgba(10,10,10,0.96) 58%, rgba(20,19,19,0) 100%)',
        }}
      />

      {/* ── Bottom dissolve fade ── */}
      <div
        className="absolute bottom-[-1px] left-0 right-0 pointer-events-none z-[10]"
        style={{
          height: '160px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, #0d0c0c 100%)',
        }}
      />

      {/* ── Main content ── */}
      <div
        className="relative z-[5] flex flex-col items-center text-center w-full mx-auto px-6"
        style={{
          maxWidth: 'min(1100px, 88vw)',
          paddingTop: '16svh',
          paddingBottom: '8rem',
          minHeight: '100svh',
          justifyContent: 'center',
          gap: '1.5rem',
        }}
      >

        {/* ── Status Pill ── */}
        <div
          className="flex items-center gap-2.5 w-fit mx-auto rounded-full border border-white/[0.15] transition-all duration-300 cursor-default"
          style={{
            padding: '0.6rem 1.25rem',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500"
            style={{ animation: 'contactPulse 2.2s ease-in-out infinite' }}
          />
          <span
            className="text-white whitespace-nowrap leading-none"
            style={{
              fontFamily: 'Inter, system-ui, "Helvetica Neue", Arial, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
            }}
          >
            Available for new projects
          </span>
        </div>

        {/* ── Heading ── */}
        <h1
          className="text-[rgb(242,237,230)] font-semibold leading-[1.05]"
          style={{
            fontSize: 'clamp(3rem, 6vw, 6.5rem)',
            letterSpacing: '-0.22rem',
          }}
        >
          Let's INCREASE YOUR<br />BOOKINGS.
        </h1>

        {/* ── Subtitle ── */}
        <p
          className="font-medium leading-[1.7] max-w-[560px]"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
            fontSize: 'clamp(15px, 1.6vw, 19px)',
            letterSpacing: '-0.01em',
            color: 'rgba(209,213,217,0.88)',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          WANT TO AUTOMATE YOUR BOOKINGS & Provide your customers THE ULTIMATE BOOKING EXPERIENCE? Reach out and let's talk —{' '}
          <span
            className="font-semibold text-white"
            style={{ textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
          >
            I respond within 24 hours.
          </span>
        </p>

        {/* ── Contact Cards ── */}
        <div
          className="flex flex-col sm:flex-row w-full mt-3"
          style={{ gap: '1rem', maxWidth: '860px' }}
        >
          {contacts.map(({ label, value, href, external }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="group flex-1 flex flex-col justify-between rounded-2xl transition-all duration-300 no-underline"
              style={{
                padding: '1.25rem 1.5rem',
                aspectRatio: '4/3',
                background: 'rgba(242,237,230,0.07)',
                backdropFilter: 'blur(1rem)',
                WebkitBackdropFilter: 'blur(1rem)',
                border: '1px solid rgba(255,255,255,0.07)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(242,237,230,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 44px rgba(0,0,0,0.35)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(242,237,230,0.07)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Label */}
              <span
                className="uppercase font-normal"
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  color: 'rgba(242,237,230,0.45)',
                }}
              >
                {label}
              </span>

              {/* Divider */}
              <div
                className="w-full my-3 flex-shrink-0"
                style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}
              />

              {/* Value + Arrow row */}
              <div className="flex items-end justify-between">
                <span
                  className="text-[rgb(242,237,230)] font-medium leading-tight"
                  style={{
                    fontSize: 'clamp(0.9rem, 1.3vw, 1.2rem)',
                    letterSpacing: '-0.025em',
                    wordBreak: 'break-all',
                  }}
                >
                  {value}
                </span>
                <span
                  className="text-[rgb(242,237,230)] text-base flex-shrink-0 ml-2 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  style={{ transform: 'translate(-5px, 5px)' }}
                  ref={el => {
                    if (el) {
                      el.closest('.group')?.addEventListener('mouseenter', () => {
                        el.style.transform = 'translate(0,0)';
                      });
                      el.closest('.group')?.addEventListener('mouseleave', () => {
                        el.style.transform = 'translate(-5px, 5px)';
                      });
                    }
                  }}
                >
                  ↗
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes contactPulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
          }
          50% {
            opacity: 0.7;
            box-shadow: 0 0 16px rgba(34, 197, 94, 0.9);
          }
        }
      `}</style>
    </section>
  );
};

export default ContactUs;
