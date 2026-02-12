"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import AnimatedBodyText from "../AnimatedBodyText/AnimatedBodyText";
import "./FAQ.css";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const answerRefs = useRef([]);

  const faqs = [
    {
      question: "Why should I use ToriAte instead of Calendly, Setmore, or a website form?",
      answer:
        "Traditional booking tools force your customers to leave WhatsApp, fill out forms, and navigate clunky websites. With ToriAte, your customers stay in WhatsApp—the app they already live in—and book in 10 seconds. No downloads. No account creation. No friction. You get more bookings; they get a frictionless experience. Plus, our WhatsApp reminders have 98% open rates (vs 20% for emails), so your customers actually show up.",
    },
    {
      question: "Do my customers need to download an app to book?",
      answer:
        "Absolutely not. That is our unfair advantage. Your customers already have WhatsApp. They simply send a 'Hi' to your number, pick a slot, and book. No links to slow websites, no login forms, and zero friction. It’s why Toriate converts 3x better than traditional booking links.",
    },
    {
      question: "How fast is the booking process?",
      answer:
        "Under 10 seconds. Seriously. Our average booking time is 87% faster than traditional appointment tools—because no one wants to “open a tab” and “fill a form” in 2025.",
    },
    {
      question: "Can I collect payments before the appointment?",
      answer:
        "Yes. Stop chasing invoices. You can set Toriate to require payment before confirming the slot. The user gets a secure payment link right in the chat. Once they pay, the booking is locked. It’s the best way to filter out non-serious leads and secure your revenue upfront.",
    },
    {
      question: "What if a client cancels or tries to 'ghost' me?",
      answer:
        "No-shows are nearly impossible with Toriate. Unlike emails which get ignored, WhatsApp messages have a 98% open rate. We send automated reminders (e.g., 24 hours and 1 hour before) directly to their chat. If they need to reschedule, they can do it with one tap, freeing up the slot for someone else instantly.",
    },
    {
      question: "Do I need technical skills to set up ToriAte?",
      answer:
        "Zero. If you can send a WhatsApp message, you can set up Toriate. It takes about 5 minutes. You just connect your WhatsApp Business Account, link your Google Calendar, set your working hours, and you are live. No coding. No complex integrations. No IT team needed.",
    },
    {
      question: "Can my customers reschedule or cancel appointments directly through WhatsApp?",
      answer:
        "Yes. They reply 'reschedule' or 'cancel' in WhatsApp, instantly see available slots, and pick a new time. One-tap rescheduling. No phone calls. No back-and-forth emails. They control their appointment. You get freed-up slots that you can instantly re-sell. Everyone wins.",
    },
    {
      question: "Is this just for 1-on-1 meetings, or can I host events?",
      answer:
        "We handle both. Whether you are a consultant doing 1-on-1 calls or an event organizer selling 50 tickets for a single workshop, Toriate handles the capacity. You can set a limit (e.g., '50 seats'), and once they are sold out, the slot automatically closes.",
    },
    {
      question: "What if I have multiple team members? Can they all manage bookings?",
      answer:
        "Yes. ToriAte supports unlimited team members with customizable permissions. Your receptionist can view bookings, your therapist can set availability, your manager can see analytics—all synced in real-time. Everyone stays on the same page.",
    },
    {
      question: "I have clients in different time zones (US, Dubai, India). Will this work?",
      answer:
        "Seamlessly. Toriate automatically detects the time zone of your client. You see the appointment in your local time, and they see the slots in theirs. No more 'Wait, is that EST or IST?'' confusion.",
    },
    {
      question: "Is my data (and my client's data) safe?",
      answer:
        "100% Secure. We use the official WhatsApp Business API (the same infrastructure used by major banks and airlines) and Enterprise-grade encryption. Your data is your property; we just help you organize it. We are built to serve global standards, from US Corporations to local businesses. We never store customer chats.",
    },
    {
      question: "Can I see analytics? How many customers booked?",
      answer:
        "Yes, but we hate clutter. Most platforms give you a dashboard that looks like an airplane cockpit—confusing and full of 'vanity metrics' you’ll never use. Toriate gives you a Zero-Fluff Dashboard. You get a clean, single-view snapshot of the only numbers that actually affect your bank account: Total Revenue Collected 💰 < br/> - Confirmed Bookings vs. No-Shows 📉 < br/> - Most Popular Services 🏆 No data fatigue. Just glance, check your growth, and get back to business.",
    },
    {
      question: "How much does ToriAte cost? Are there any hidden fees?",
      answer:
        "We believe in transparent pricing with no surprises. Plans scale with your business—pay for what you use, nothing more. No long-term contracts. No hidden setup fees. No per-message charges hidden in the fine print. You can start free and upgrade as you grow.",
    },
    {
      question: "Is there a free trial? How do I Book ANY SERVICE IN 10 SEC?",
      answer:
        "Yes, but strictly for our early adopters. Since we are in our global launch phase (India $\rightarrow$ Dubai $\rightarrow$ US), we are opening a Full-Access Free Trial exclusively for our initial batch of customers. If you are reading this, you are in time. No credit card required. No strings attached. Just sign up, feel the speed of 20-second bookings, and see the results before you pay a single ₹ (or $).",
    },
  ];

  const toggleFAQ = (index) => {
    if (activeIndex === index) {
      // Close the currently open FAQ
      gsap.to(answerRefs.current[index], {
        height: 0,
        duration: 0.5,
        ease: "power3.inOut",
      });
      setActiveIndex(null);
    } else {
      // Close previously open FAQ
      if (activeIndex !== null) {
        gsap.to(answerRefs.current[activeIndex], {
          height: 0,
          duration: 0.5,
          ease: "power3.inOut",
        });
      }

      // Open new FAQ
      const element = answerRefs.current[index];
      const autoHeight = element.scrollHeight;
      gsap.to(element, {
        height: autoHeight,
        duration: 0.5,
        ease: "power3.inOut",
      });
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    // Set initial height to 0 for all answers
    answerRefs.current.forEach((ref) => {
      if (ref) {
        gsap.set(ref, { height: 0 });
      }
    });
  }, []);

  return (
    <section className="faq-section">
      <div className="faq-header">
        <h2>
          FREQUENTLY
          <br />
          ASKED QUESTIONS
        </h2>
      </div>

      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item-container ${activeIndex === index ? "active" : ""}`}
          >
            <div className="faq-item">
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <h3>{faq.question}</h3>
                <div className="faq-arrow">
                  {activeIndex === index ? (
                    <span className="arrow-down">↓</span>
                  ) : (
                    <span className="arrow-right">→</span>
                  )}
                </div>
              </div>
              <div
                ref={(el) => (answerRefs.current[index] = el)}
                className="faq-answer"
              >
                <AnimatedBodyText>{faq.answer}</AnimatedBodyText>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;