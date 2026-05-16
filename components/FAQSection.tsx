"use client";

import type { FAQ } from "@/content/types";
import { pushDataLayer } from "@/lib/tracking";

type FAQSectionProps = {
  title?: string;
  intro?: string;
  faqs: FAQ[];
};

export function FAQSection({ title = "Frequently asked questions", intro, faqs }: FAQSectionProps) {
  return (
    <section className="section faq-section" aria-labelledby="faq-heading">
      <div className="container narrow">
        <p className="eyebrow">Questions</p>
        <h2 id="faq-heading">{title}</h2>
        {intro ? <p className="section-intro">{intro}</p> : null}
        <div className="faq-list">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              onToggle={(event) => {
                if (event.currentTarget.open) {
                  pushDataLayer("faq_open", { faq_question: faq.question });
                }
              }}
            >
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
