"use client";

import "../legal.css";
import Nav from "@/components/Nav/Nav";
import ConditionalFooter from "@/components/ConditionalFooter/ConditionalFooter";
import Copy from "@/components/Copy/Copy";
import SectionPill from "@/components/SectionPill/SectionPill";

const sections = [
  {
    title: "Overview",
    body: "This Privacy Policy explains how Tori Ate collects, uses, stores, shares &  protects information when businesses use our WhatsApp-native appointment booking platform, website, dashboard, support channels, integrations &  related services. It applies to business users, staff accounts, customers who book through a Tori Ate-powered flow &  visitors to our website.",
  },
  {
    title: "Information businesses provide",
    body: "We collect business account details such as business name, contact information, billing details, services offered, prices, locations, staff members, operating hours, appointment rules, cancellation policies &  dashboard preferences. We also collect information entered by team members while configuring booking workflows or requesting support.",
  },
  {
    title: "Customer booking information",
    body: "When a customer uses a booking flow powered by Tori Ate, we may process their name, WhatsApp number, selected service, selected time slot, payment status, appointment history, reschedule or cancellation requests &  message metadata required to confirm, remind, or manage the appointment.",
  },
  {
    title: "Calendar, messaging &  payment integrations",
    body: "If a business connects Google Calendar, WhatsApp, payment providers, or other tools, we use the connected data only to provide the service: showing live availability, preventing double-bookings, sending confirmations and reminders, generating payment links, reconciling payment status &  updating appointment records.",
  },
  {
    title: "How we use information",
    body: "We use information to operate the booking system, provide customer support, send operational messages, improve reliability, measure product performance, prevent fraud or abuse, maintain security, comply with legal obligations, process payments &  communicate service updates to businesses.",
  },
  {
    title: "Operational WhatsApp messages",
    body: "Tori Ate sends transactional and operational messages related to booking flows, such as service selection, slot availability, payment links, confirmations, reminders, rescheduling, cancellations &  support. Businesses are responsible for ensuring they have the right permissions and consents to contact their customers.",
  },
  {
    title: "Analytics and product improvement",
    body: "We may use aggregated or de-identified data to understand booking conversion, no-show reduction, feature usage, system performance &  product reliability. Aggregated insights do not identify individual customers and may be used to improve the platform or communicate benchmark-level results.",
  },
  {
    title: "Sharing with service providers",
    body: "We may share limited information with trusted service providers who help us host infrastructure, process payments, deliver WhatsApp messages, manage calendars, provide analytics, monitor errors, secure the platform &  support customers. These providers are permitted to use information only to provide services to Tori Ate.",
  },
  {
    title: "Legal and safety disclosures",
    body: "We may disclose information if required by law, regulation, court order, government request, payment dispute process, security investigation, or to protect the rights, safety &  property of Tori Ate, our users, customers, or the public.",
  },
  {
    title: "Data storage and retention",
    body: "We retain business, booking, billing &  operational records while an account is active and for as long as reasonably needed for legal, tax, accounting, security, fraud-prevention, dispute-resolution &  service-continuity purposes. Businesses may request deletion or export of eligible data, subject to applicable law and operational requirements.",
  },
  {
    title: "Security practices",
    body: "We use reasonable technical and organizational safeguards designed to protect information, including access controls, secure infrastructure, monitoring &  limiting access to people and systems that need the information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
  },
  {
    title: "Your rights and choices",
    body: "Depending on applicable law, users and customers may have rights to access, correct, delete, restrict, or receive a copy of personal information. Businesses can contact us for account-level requests &  customers may also contact the business they booked with for appointment-specific requests.",
  },
  {
    title: "Children's data",
    body: "Tori Ate is designed for businesses and appointment booking workflows, not for children. We do not knowingly collect personal information from children without appropriate authorization. If you believe a child provided information improperly, contact us so we can review it.",
  },
  {
    title: "Changes to this policy",
    body: "We may update this Privacy Policy as our product, integrations, legal obligations, or business operations change. If changes are material, we will take reasonable steps to notify affected businesses through the website, dashboard, email, or another appropriate channel.",
  },
  {
    title: "Contact us",
    body: "For privacy questions, data requests, or concerns, contact us at privacy@toriate.com. Please include enough detail for us to identify the relevant account, booking, or request.",
  },
];

const PrivacyPolicyPage = () => {
  return (
    <>
      <Nav />
      <main className="legal-page">
        <section className="legal-hero">
          <div className="container">
            <SectionPill label="Privacy Policy" />
            <Copy delay={0.1}>
              <h1>Privacy built for booking trust.</h1>
            </Copy>
            <p>Last updated: June 2026</p>
          </div>
        </section>
        <section className="legal-content">
          <div className="container legal-grid">
            {sections.map((section, index) => (
              <article className="legal-card" key={section.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <ConditionalFooter />
    </>
  );
};

export default PrivacyPolicyPage;
