"use client";

import { useState, type ReactNode } from "react";
export function Accordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item, index) => (
        <div key={item.question}>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between py-4 text-left text-[15px] font-medium text-primary"
            aria-expanded={active === index}
            onClick={() => setActive(active === index ? null : index)}
          >
            <span>{item.question}</span>
            <span className="ml-4 text-xl font-normal text-accent">
              {active === index ? "−" : "+"}
            </span>
          </button>
          {active === index && (
            <p className="pb-5 pr-8 text-sm leading-6 text-muted">
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
export type AccordionContent = ReactNode;
