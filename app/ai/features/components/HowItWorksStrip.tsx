"use client";

import { useEffect, useState } from "react";
import { HOW_IT_WORKS_STEPS } from "@/lib/aiFeaturesPageData";
import ProductMockup from "./ProductMockup";

export default function HowItWorksStrip() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStep((s) => ((s % 3) + 1) as 1 | 2 | 3);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="feat-how">
      <div className="feat-how-steps">
        {HOW_IT_WORKS_STEPS.map((item) => (
          <button
            key={item.step}
            type="button"
            className={`feat-how-step${step === item.step ? " is-active" : ""}`}
            onClick={() => setStep(item.step as 1 | 2 | 3)}
          >
            <span className="feat-how-num">{item.step.toLocaleString("fa-IR")}</span>
            <div>
              <strong>{item.title}</strong>
              <span>{item.hint}</span>
            </div>
          </button>
        ))}
      </div>
      <ProductMockup variant="steps" activeStep={step} />
    </div>
  );
}
