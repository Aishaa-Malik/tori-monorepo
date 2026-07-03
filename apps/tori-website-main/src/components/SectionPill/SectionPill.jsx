"use client";
import "./SectionPill.css";

const SectionPill = ({ label, size = "default" }) => {
  return (
    <div className={`section-pill${size === "large" ? " section-pill--large" : ""}`}>
      <span className="section-pill-dot" />
      <span className="section-pill-label">{label}</span>
    </div>
  );
};

export default SectionPill;
