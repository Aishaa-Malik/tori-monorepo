"use client";
import "./CTAWindow.css";

import Copy from "../Copy/Copy";
import AnimatedButton from "../AnimatedButton/AnimatedButton";
import AnimatedBodyText from "../AnimatedBodyText/AnimatedBodyText";

const CTAWindow = ({
  img,
  header,
  callout,
  description,
  title,
  subtitle,
  buttonLabel,
  buttonRoute,
  helperText,
  centered = false,
  bgImg,
}) => {
  const isNewCTA = Boolean(title && subtitle && buttonLabel && helperText);

  if (isNewCTA) {
    return (
      <section className={`cta-window ${centered ? "cta-centered" : ""}`}>
        <div
          className="container cta-center-container"
          style={bgImg ? { backgroundImage: `url(${bgImg})` } : undefined}
        >
          {bgImg && <div className="cta-bg-overlay"></div>}
          <Copy delay={0.1}>
            <h2 className="cta-title">
              {String(title)
                .replace(/\.$/, "")
                .replace(/\\n/g, "\n")
                .split(/\r?\n/)
                .map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
            </h2>
          </Copy>
          <div className="cta-subtitle">
            <AnimatedBodyText animate={false}>{subtitle}</AnimatedBodyText>
          </div>
          <div className="cta-helper">
            <AnimatedBodyText animate={false}>{helperText}</AnimatedBodyText>
          </div>
          <Copy delay={0.25}>
            <div className="cta-btn-wrapper">
              <AnimatedButton
                label={buttonLabel}
                route={buttonRoute}
                animateOnScroll={false}
              />
            </div>
          </Copy>
        </div>
      </section>
    );
  }

  return (
    <section className="cta-window">
      <div className="container">
        <div className="cta-window-img-wrapper">
          <img src={img} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="cta-window-img-overlay"></div>
        <div className="cta-window-header">
          <Copy delay={0.1}>
            <h1>{header}</h1>
          </Copy>
        </div>
        <div className="cta-window-footer">
          <div className="cta-window-callout">
            <Copy delay={0.1}>
              <h3>{callout}</h3>
            </Copy>
          </div>
          <div className="cta-window-description">
            <Copy delay={0.1}>
              <p>{description}</p>
            </Copy>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAWindow;
