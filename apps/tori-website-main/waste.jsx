import { forwardRef } from "react";
import Image from "next/image";

const Card = forwardRef(
  (
    {
      id,
      frontSrc,
      frontAlt,
      frontText,
      backText,
      price,
      period,
      description,
      buttonText,
      features,
      pricingInfo,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="card">
        <div className="card-wrapper">
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <div className="text-front">{frontText}</div>
            </div>
            <div className="flip-card-back">
              <div className="pricing-card">
                <div className="plan-title">
                  <h2>Enterprise</h2>
                  <span className="plan-subtitle">
                    {id === "card-1"
                      ? "For individuals"
                      : id === "card-2"
                      ? "For small teams"
                      : "For large organizations"}
                  </span>
                </div>
                <div>
                  <div className="price-container">
                    <h3>{price}</h3>
                    <span className="period">{period}</span>
                  </div>
                  <p className="description">{description}</p>
                  <button className="join-button">{buttonText}</button>
                  <ul className="features">
                    {features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="pricing-info">
                  <div className="pricing-tiers">
                    {pricingInfo.map((tier, index) => (
                      <div
                        key={index}
                        className={`price-tier ${
                          tier.current ? "current" : "other"
                        }`}
                      >
                        <span className="price-value">{tier.price}</span>
                        <span className="price-range">{tier.range}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
