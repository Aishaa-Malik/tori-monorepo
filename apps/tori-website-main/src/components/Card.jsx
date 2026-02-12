import React, { forwardRef } from "react";

const Card = forwardRef(
  (
    {
      id,
      frontSrc,
      frontAlt,
      price,
      period,
      description,
      buttonText,
      features,
      pricingInfo,
      frontText,
      planTitle,
      planSubtitle,
      badge,
    },
    ref
  ) => {
    const planClass = (planTitle || "").toLowerCase();
    return (
      <div className="card" id={id} ref={ref}>
        <div className="card-wrapper">
          <div className="flip-card-inner">
            <div className="flip-card-front">
              {frontSrc ? (
                <img
                  src={frontSrc}
                  alt={frontAlt}
                  width={600}
                  height={600}
                  style={{ color: "transparent" }}
                />
              ) : (
                <div className="text-front">{frontText}</div>
              )}
            </div>

            <div className="flip-card-back">
              <div className={`pricing-card ${planClass}`}>
                <div className="plan-title">
                  <h2>{planTitle}</h2>
                  <div className="title-divider"></div>
                  <p className="plan-subtitle">{planSubtitle}</p>
                  {badge && <span className="plan-badge">{badge}</span>}
                </div>
                <div className="card-divider"></div>

                <div className="price-container">
                  <h1 className="price">{price}</h1>
                  <span className="period">{period}</span>
                </div>

                <div className="features-box">
                  <ul className="features">
                    {features.map((feature, index) => (
                      <li key={index} className={feature.ok ? "ok" : "bad"}>
                        {feature.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="description">{description}</p>

                <button className="join-button">{buttonText}</button>
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
