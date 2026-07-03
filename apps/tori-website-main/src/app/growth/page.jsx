"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./growth.css";
import Nav from "@/components/Nav/Nav";
import ConditionalFooter from "@/components/ConditionalFooter/ConditionalFooter";
import Copy from "@/components/Copy/Copy";
import SectionPill from "@/components/SectionPill/SectionPill";
import AnimatedButton from "@/components/AnimatedButton/AnimatedButton";

gsap.registerPlugin(ScrollTrigger);

const comparisonRows = [
  ["WhatsApp-native booking flow", true, false],
  ["Live Google Calendar slot sync", true, "partial"],
  ["Payment before confirmation", true, false],
  ["Automated WhatsApp reminders", true, "partial"],
  ["No customer app download", true, false],
  ["Admin dashboard for staff and revenue", true, "partial"],
  ["Low-risk pilot before rollout", true, false],
  ["Multi-location workflows", true, "enterprise"],
  ["Built for repeat bookings", true, false],
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const CheckCell = ({ value }) => {
  if (value === true) return <span className="growth-check">✓</span>;
  if (value === "partial") return <span className="growth-partial">Partial</span>;
  if (value === "enterprise") return <span className="growth-partial">Custom</span>;
  return <span className="growth-cross">×</span>;
};

const GrowthPage = () => {
  const pageRef = useRef(null);
  const [appointments, setAppointments] = useState(200);
  const [noShowRate, setNoShowRate] = useState(15);
  const [price, setPrice] = useState(1200);
  const [teamSize, setTeamSize] = useState(2);
  const [deposits, setDeposits] = useState(false);

  const results = useMemo(() => {
    const missedAppointments = appointments * (noShowRate / 100);
    const lostRevenue = missedAppointments * price;
    const reminderRecovery = lostRevenue * 0.4;
    const depositRecovery = deposits ? lostRevenue * 0.15 : lostRevenue * 0.25;
    const subscription = teamSize > 6 ? 5499 : teamSize > 3 ? 2499 : 1299;
    const netSavings = reminderRecovery + depositRecovery - subscription;

    return {
      missedAppointments,
      lostRevenue,
      reminderRecovery,
      depositRecovery,
      subscription,
      netSavings,
    };
  }, [appointments, noShowRate, price, teamSize, deposits]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".growth-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 42 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              once: true,
            },
          }
        );
      });

      gsap.to(".switch-word-stack span", {
        opacity: (index) => (index === 2 ? 1 : 0.18),
        y: (index) => (index - 2) * -12,
        stagger: 0.08,
        repeat: -1,
        yoyo: true,
        duration: 1.8,
        ease: "sine.inOut",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Nav />
      <main className="growth-page" ref={pageRef}>
        <section className="growth-hero">
          <div className="growth-orb growth-orb-one"></div>
          <div className="growth-orb growth-orb-two"></div>
          <div className="container growth-hero-inner">
            <div className="growth-hero-copy growth-reveal">
              <SectionPill label="Growth Tools" />
              <Copy delay={0.1}>
                <h1>Know what slow booking is costing you.</h1>
              </Copy>
              <p>
                Calculate recovered revenue, compare Tori Ate against old booking software,
                and see why WhatsApp-native booking wins for appointment-heavy businesses.
              </p>
            </div>
            <div className="growth-hero-card growth-reveal">
              <p>Estimated monthly upside</p>
              <h2>{formatCurrency(Math.max(results.netSavings, 0))}</h2>
              <span>Based on Indian appointment-business benchmarks</span>
            </div>
          </div>
        </section>

        <section className="roi-section" id="roi-calculator">
          <div className="container">
            <div className="growth-section-header growth-reveal">
              <SectionPill label="ROI Calculator" />
              <h2>See how much no-shows quietly cost.</h2>
              <p>Adjust the numbers to match your Indian clinic, court, turf, studio, salon, or appointment business.</p>
            </div>

            <div className="roi-grid">
              <div className="roi-panel growth-reveal">
                <div className="roi-panel-heading">
                  <h3>Your business</h3>
                  <p>Adjust to match your current booking flow</p>
                </div>

                <label className="roi-control">
                  <span>Monthly appointments <strong>{appointments}</strong></span>
                  <input type="range" min="50" max="800" value={appointments} onChange={(e) => setAppointments(Number(e.target.value))} />
                  <small><span>50</span><span>800</span></small>
                </label>

                <label className="roi-control">
                  <span>Current no-show rate <strong>{noShowRate}%</strong></span>
                  <input type="range" min="2" max="40" value={noShowRate} onChange={(e) => setNoShowRate(Number(e.target.value))} />
                  <small><span>2%</span><span>40%</span></small>
                </label>

                <label className="roi-control">
                  <span>Average service price <strong>{formatCurrency(price)}</strong></span>
                  <input type="range" min="400" max="4000" step="50" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
                  <small><span>₹400</span><span>₹4,000</span></small>
                </label>

                <div className="team-picker">
                  <span>Team size</span>
                  {[1, 2, 3, 4, 6, 8, 10, 12].map((size) => (
                    <button
                      key={size}
                      className={teamSize === size ? "active" : ""}
                      onClick={() => setTeamSize(size)}
                      type="button"
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <label className="deposit-toggle">
                  <span>
                    Already collecting deposits?
                    <small>Deposits can reduce remaining no-shows by another 15%.</small>
                  </span>
                  <input type="checkbox" checked={deposits} onChange={(e) => setDeposits(e.target.checked)} />
                </label>
              </div>

              <div className="roi-results growth-reveal">
                <div className="roi-result-card danger">
                  <p>Revenue currently lost to no-shows</p>
                  <h3>{formatCurrency(results.lostRevenue)}<span>/month</span></h3>
                  <small>{Math.round(results.missedAppointments)} missed appointments/month</small>
                </div>
                <div className="roi-result-card success">
                  <p>Revenue recovered with WhatsApp reminders</p>
                  <h3>+{formatCurrency(results.reminderRecovery)}<span>/month</span></h3>
                  <small>Automated reminders reduce preventable no-shows.</small>
                </div>
                <div className="roi-result-card success">
                  <p>Additional recovery with deposits</p>
                  <h3>+{formatCurrency(results.depositRecovery)}<span>/month</span></h3>
                  <small>Payment links increase commitment before confirmation.</small>
                </div>
                <div className="roi-result-card neutral">
                  <p>Tori Ate subscription</p>
                  <h3>-{formatCurrency(results.subscription)}<span>/month</span></h3>
                  <small>Estimated Indian monthly plan based on team size.</small>
                </div>
                <div className="roi-result-card total">
                  <p>Net monthly savings</p>
                  <h3>+{formatCurrency(Math.max(results.netSavings, 0))}<span>/month</span></h3>
                  <small>{formatCurrency(Math.max(results.netSavings * 12, 0))}/year recovered</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="switch-section" id="why-switch">
          <div className="container">
            <div className="growth-section-header growth-reveal">
              <SectionPill label="Why switch?" />
              <h2>Ditch the booking tool. Get the WhatsApp booking stack.</h2>
              <p>Most scheduling tools still make customers leave the chat, open a link, fill a form &  hope they remember to show up.</p>
            </div>

            <div className="comparison-card growth-reveal">
              <div className="comparison-head">
                <span>Features</span>
                <strong>Tori Ate</strong>
                <strong>Traditional software</strong>
              </div>
              {comparisonRows.map(([feature, tori, oldTool]) => (
                <div className="comparison-row" key={feature}>
                  <span>{feature}</span>
                  <CheckCell value={tori} />
                  <CheckCell value={oldTool} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="switch-animation-section" id="switch-reasons">
          <div className="container switch-animation-inner growth-reveal">
            <h2 className="switch-carousel-headline">
              <span className="switch-carousel-static">Tori Ate does not miss on</span>
              <span className="switch-carousel-window" aria-label="WhatsApp-native booking">
                <span className="switch-carousel-track" aria-hidden="true">
                  <span>missed calls</span>
                  <span>forgotten reminders</span>
                  <span>WhatsApp-native booking</span>
                  <span>payment links</span>
                  <span>live slots</span>
                  <span>reminders</span>
                  <span>admin control</span>
                  <span>missed calls</span>
                  <span>forgotten reminders</span>
                  <span>WhatsApp-native booking</span>
                </span>
              </span>
            </h2>
            <p>
              Live slots, payment links, reminders &  admin control work together
              so your team stops chasing bookings and starts protecting revenue.
            </p>
            <AnimatedButton label="Start with Tori Ate" route="/studio" animateOnScroll={false} />
          </div>
        </section>
      </main>
      <ConditionalFooter />
    </>
  );
};

export default GrowthPage;
