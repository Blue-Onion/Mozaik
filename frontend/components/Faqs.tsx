"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Mozaik?",
    answer:
      "Mozaik is an AI-powered Manim video generator that turns math concepts, diagrams, and ideas into clean, smooth animations—instantly.",
  },
  {
    question: "Do I need to know Manim or Python?",
    answer:
      "Nope! Mozaik handles the coding for you. Just upload a concept, diagram, or prompt, and it generates polished animations automatically.",
  },
  {
    question: "What file formats can I export?",
    answer:
      "You can export high-quality videos in MP4, transparent videos, and smooth SVG sequences for advanced workflows.",
  },
  {
    question: "Can I customize animations?",
    answer:
      "Yes! You can tweak colors, timing, camera movement, easing, and layout. Every animation is fully adjustable to match your style.",
  },
  {
    question: "Is my content safe?",
    answer:
      "Your files are processed securely, and nothing is used to train the model. Everything stays private to your workspace.",
  },
];


export default function Faqs() {
  return (
    <section className="min-h-screen py-24 bg-gradient-to-b from-white to-blue-50 flex items-center">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="mx-auto ">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
