"use client";

import "../legal.css";
import Nav from "@/components/Nav/Nav";
import ConditionalFooter from "@/components/ConditionalFooter/ConditionalFooter";
import Copy from "@/components/Copy/Copy";
import SectionPill from "@/components/SectionPill/SectionPill";

const sections = [
  {
    title: "Agreement to these terms",
    body: "These Terms & Conditions govern access to and use of Tori Ate's website, dashboard, WhatsApp-native booking workflows, integrations, support &  related services. By creating an account, connecting a business, using the service, or allowing customers to book through Tori Ate, you agree to these terms on behalf of yourself or the business you represent.",
  },
  {
    title: "Who may use the service",
    body: "Tori Ate is intended for appointment-heavy businesses and authorized team members. You must have the authority to bind the business, configure booking rules, connect calendars or WhatsApp accounts, manage payment settings &  provide customer-facing information through the platform.",
  },
  {
    title: "Business responsibilities",
    body: "You are responsible for the accuracy of services, prices, taxes, staff availability, locations, refund rules, cancellation policies, booking terms &  customer communications. Tori Ate provides the booking layer, but the business remains responsible for delivering the appointment or service sold to customers.",
  },
  {
    title: "Accounts and security",
    body: "You must keep login credentials secure, restrict dashboard access to authorized people, promptly remove access for former staff &  notify us if you suspect unauthorized use. You are responsible for actions taken through your account or connected systems unless caused by Tori Ate's breach of these terms.",
  },
  {
    title: "WhatsApp and customer messaging",
    body: "You are responsible for obtaining any required customer permissions or consents for WhatsApp messages and ensuring your use complies with applicable law, WhatsApp policies &  industry obligations. Tori Ate may suspend messaging workflows that appear abusive, unlawful, or likely to harm deliverability.",
  },
  {
    title: "Calendar and availability integrations",
    body: "If you connect Google Calendar or another availability source, you authorize Tori Ate to read and update availability as needed to show live slots, prevent double-booking, create appointments, reschedule bookings &  keep booking records accurate.",
  },
  {
    title: "Payments, deposits &  refunds",
    body: "Payment links, deposits, subscription fees &  customer payments may be processed through third-party payment providers. Businesses are responsible for their customer refund policies, failed payment handling, payment disputes, taxes, invoices &  compliance with payment-provider terms.",
  },
  {
    title: "Subscriptions and billing",
    body: "Plan pricing, billing cycles, usage limits &  included features are shown at purchase, in the dashboard, or in an order form. Subscription fees are due in advance unless stated otherwise. Fees are generally non-refundable except where required by law or agreed in writing.",
  },
  {
    title: "Acceptable use",
    body: "You may not use Tori Ate for spam, unlawful messaging, deceptive bookings, harassment, malware, security probing, reverse engineering, scraping, bypassing limits, infringing content, or activity that could harm customers, connected platforms, service reliability, or Tori Ate's reputation.",
  },
  {
    title: "Service availability",
    body: "We aim to provide a reliable service, but availability may be affected by maintenance, upgrades, internet issues, third-party outages, WhatsApp or calendar-provider limitations, payment-provider failures, force majeure events, or issues outside our reasonable control.",
  },
  {
    title: "Third-party platforms",
    body: "Tori Ate may depend on third-party platforms such as WhatsApp, Google Calendar, payment processors, hosting providers, analytics tools &  communication services. Those platforms are governed by their own terms, policies, limitations &  availability.",
  },
  {
    title: "Intellectual property",
    body: "Tori Ate owns the platform, software, workflows, designs, documentation, branding &  related intellectual property. Businesses retain ownership of their business data and customer information, subject to the rights needed for Tori Ate to provide the service.",
  },
  {
    title: "Confidentiality",
    body: "Non-public information shared between Tori Ate and a business, including pricing, product plans, technical information, customer lists, credentials &  operational data, should be treated as confidential and used only for the purpose of using or providing the service.",
  },
  {
    title: "Suspension or termination",
    body: "We may suspend or terminate access if fees are unpaid, security risk is detected, legal requirements apply, third-party platform rules are violated, or use of the service creates risk for Tori Ate, customers, or other businesses. You may stop using the service at any time subject to your billing terms.",
  },
  {
    title: "Disclaimers",
    body: "The service is provided on an as-is and as-available basis. We do not guarantee that the service will be uninterrupted, error-free, or that every booking, reminder, payment, or integration will always complete successfully.",
  },
  {
    title: "Limitation of liability",
    body: "To the maximum extent permitted by law, Tori Ate will not be liable for indirect, incidental, consequential, special, punitive, or lost-profit damages. Our total liability for claims related to the service is limited to the amount paid to Tori Ate for the service during the three months before the event giving rise to the claim.",
  },
  {
    title: "Changes to these terms",
    body: "We may update these terms as the product, legal requirements, or business operations change. If changes are material, we will take reasonable steps to notify affected businesses. Continued use of the service after updates means you accept the updated terms.",
  },
  {
    title: "Contact",
    body: "For legal, billing, or terms-related questions, contact us at legal@toriate.com. Please include your business name and account details so we can respond properly.",
  },
];

const TermsPage = () => {
  return (
    <>
      <Nav />
      <main className="legal-page">
        <section className="legal-hero">
          <div className="container">
            <SectionPill label="Terms & Conditions" />
            <Copy delay={0.1}>
              <h1>Terms that keep the booking layer clear.</h1>
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

export default TermsPage;
