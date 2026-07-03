"use client";

import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import AnimatedBodyText from "../AnimatedBodyText/AnimatedBodyText";
import SectionPill from "../SectionPill/SectionPill";
import "./FAQ.css";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const answerRefs = useRef([]);

  const faqs = [
    {
      question: "Why should I use Tori Ate instead of Calendly, Setmore, or a website form?",
      answer:
        "Because your customers are already on WhatsApp. Calendly-style links and website forms still force customers to open a new page, understand a new interface& complete a multi-step flow. Tori Ate keeps the booking inside WhatsApp - where the customer already feels comfortable replying.",
    },
    {
      question: "Do my customers need to download an app to book?",
      answer:
        "No. That is the point. Customers message your Tori Ate WhatsApp number, choose a service, pick a slot, pay& confirm. No app download. No login. No password.",
    },
    {
      question: "How fast is the booking process?",
      answer:
        "A typical booking can be completed in around 20 seconds once the customer starts the WhatsApp flow. They choose the service, pick an available slot, receive the payment link & confirm.",
    },
    {
      question: "Can I collect payment before the appointment?",
      answer:
        "Yes. Tori Ate can send a payment link before confirmation, so the customer commits before the slot is blocked. This is especially useful for clinics, turfs, courts, studios& premium appointment businesses where no-shows directly cost money.",
    },
    {
      question: "What if a customer cancels or tries to ghost?",
      answer:
        "Tori Ate helps reduce this with payment links, WhatsApp reminders& reschedule flows. A customer who pays first and receives reminders is less likely to casually disappear.",
    },
    {
      question: "Do I need technical skills to set up Tori Ate?",
      answer:
        "No. Your team gets onboarding support. You provide your services, timings, staff details& calendar setup. Tori Ate helps configure the booking flow.",
    },
    {
      question: "Can customers reschedule or cancel through WhatsApp?",
      answer:
        "Yes, the flow can support rescheduling and cancellation depending on your business rules. You decide how flexible you want to be.",
    },
    {
      question: "Is this only for 1-on-1 appointments?",
      answer:
        "No. Tori Ate can be used for appointment-led businesses such as physiotherapy sessions, sports court bookings, turf slots, studio sessions, recovery appointments& other scheduled services.",
    },
    {
      question: "What if I have multiple staff members?",
      answer:
        "Tori Ate can support staff and employee management through the admin dashboard. This helps owners track appointments, services& staff-linked bookings more clearly.",
    },
    {
      question: "I have customers in India, Dubai, or other time zones. Will this work?",
      answer:
        "Yes. The booking flow can be configured around your business location, calendar& operating hours. For multi-market businesses, the setup can be customized.",
    },
    {
      question: "Is my business data and customer data safe?",
      answer:
        "Tori Ate is designed to keep booking operations structured and controlled. Your business data, booking records& customer interactions should be handled through secure systems and proper access controls.",
    },
    {
      question: "Can I see analytics?",
      answer:
        "Yes. The admin dashboard helps you track bookings, revenue, staff, appointment volume& performance over selected time periods.",
    },
    {
      question: "How much does Tori Ate cost? Are there hidden fees?",
      answer:
        "Plans start from ₹1,299/month for India launch pricing. Payment gateway charges and WhatsApp message costs may apply depending on usage and provider policies. These should be clearly shown before you start.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Tori Ate can be started as a focused pilot so you can test the booking flow with real customers before scaling it across your business.",
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
        <SectionPill label="FAQ" size="large" />
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