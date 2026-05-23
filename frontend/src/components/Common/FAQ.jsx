import { useState, useCallback, useMemo } from "react";
import { FaChevronDown } from "react-icons/fa";

const faqData = [
  {
    question: "What is Raphaaa?",
    answer:
      "Raphaaa is a modern lifestyle brand offering premium fashion, collaborations, and e-commerce experiences with exclusive drops and curated collections.",
  },
  {
    question: "How can I place an order on Raphaaa?",
    answer:
      "You can browse products on our website, add items to your cart, and complete your purchase securely through our checkout page.",
  },
  {
    question: "What payment methods does Raphaaa accept?",
    answer:
      "We support Razorpay, UPI, credit/debit cards, and net banking for a seamless payment experience.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is placed, you’ll be notified via email to monitor your shipment status in real time.",
  },
  {
    question: "What is Raphaaa’s return and exchange policy?",
    answer:
      "Products can be returned or exchanged within 15 days of delivery if they are unused, unworn, and in original packaging.",
  },
  {
    question: "How do I stay updated about upcoming drops?",
    answer:
      "You can subscribe to our newsletter or follow Raphaaa on social media to get early access to exclusive launches.",
  },
  {
    question: "How do I contact Raphaaa customer support?",
    answer:
      "You can reach us via the Contact Us page, email, or our dedicated support helpline.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = useCallback(
    (idx) => setActiveIndex((curr) => (curr === idx ? null : idx)),
    []
  );

  // Smooth height animation using CSS grid rows
  const contentGrid = useMemo(
    () => "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
    []
  );

  return (
    <section className="py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            <span className="">
              Frequently Asked Questions
            </span>
          </h2>
          <div className="mt-4 h-[3px] w-40 mx-auto rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500" />
        </div>

        {/* List */}
        <div className="space-y-4 md:space-y-5">
          {faqData.map((faq, i) => {
            const open = activeIndex === i;
            return (
              <div
                key={i}
                className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600/20 via-sky-400/20 to-blue-500/20"
              >
                <div className="rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <button
                    onClick={() => toggle(i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(i);
                      }
                    }}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left"
                  >
                    <span className="text-base md:text-lg font-semibold text-slate-900">
                      {faq.question}
                    </span>

                    <span
                      className={`shrink-0 rounded-full p-2 text-white transition-transform duration-300 bg-gradient-to-br from-blue-600 to-sky-400 ${
                        open ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      <FaChevronDown />
                    </span>
                  </button>

                  <div
                    className={`${contentGrid} ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="min-h-0">
                      <div className="px-5 md:px-6 pb-5 md:pb-6 text-slate-700 leading-relaxed bg-sky-50/60 rounded-b-2xl">
                        {faq.answer}
                      </div>
                    </div>
                  </div>

                  {/* Subtle divider glow */}
                  <div className="h-[1px] mx-5 md:mx-6 mb-5 bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-slate-500 mt-10">
          Can’t find your answer? Reach out to our support team.
        </p>
      </div>
    </section>
  );
}
