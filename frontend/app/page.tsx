"use client";

import Faqs from "@/components/Faqs";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PenLine } from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
// ✔️ MANIM-THEMED FEATURES -----------------------------------
const feat = [
  {
    "title": "Create Beautiful Visuals",
    "subtitle": "Transform ideas into stunning animations.",
    "description": "Turn any concept, sketch, or reference into polished, cinematic visuals with ease.",
    "link":"/main.mp4"
  },
  {
    "title": "Customize As You Want",
    "subtitle": "Full creative control at your fingertips.",
    "description": "Adjust colors, timing, motion, style, and layout — every detail is editable to match your vision.",
    "link":"/main.png"
  }
]


// ✔️ TYPEWRITER SENTENCES ------------------------------------
export default function Home(): JSX.Element {
  const [text, setText] = useState("");
  const sentences = [
    "Bring your math ideas to life, one frame at a time.",
    "Turn static equations into smooth, beautiful animations.",
    "Animate like a pro — without touching complex code.",
  ];

  useEffect(() => {
    let i = 0;
    let j = 0;
    let currentSentence = sentences[i];
    let isDeleting = false;

    const typing = setInterval(() => {
      if (!isDeleting) {
        setText(currentSentence.slice(0, j + 1));
        j++;
        if (j === currentSentence.length) {
          isDeleting = true;
        }
      } else {
        setText(currentSentence.slice(0, j - 1));
        j--;
        if (j === 0) {
          isDeleting = false;
          i = (i + 1) % sentences.length;
          currentSentence = sentences[i];
        }
      }
    }, 80);

    return () => clearInterval(typing);
  }, []);

  return (
    <>
     <header className="fixed top-8 left-0 w-full z-50">
      <Navbar />
    </header>
    <main className="space-y-6">
      {/* HERO SECTION */}
      <section className="min-h-screen flex justify-center items-center bg-linear-to-b from-blue-300 via-gray-100 to-red-300">
        <div className="mx-auto flex flex-col items-center justify-center container space-y-8">
          <div className="flex flex-col items-center justify-center gap-5">
            <h1 className="text-6xl max-w-3xl gradient-title text-black text-center">
              Animate ideas. Explain visually. Inspire curiosity.
            </h1>
            <p className="text-muted-foreground text-center max-w-4xl">
              ManimFlow helps you turn math, diagrams, and concepts into smooth,
              professional animations without breaking your head over boilerplate code.
            </p>
          </div>

          {/* Typing Input */}
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              readOnly
              value={text}
              className="w-full h-16 rounded-3xl text-muted-foreground border-2 border-gray-300 bg-white px-6 text-lg shadow-lg focus:outline-none"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 animate-pulse text-gray-400 text-2xl">
              <PenLine />
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-32 bg-linear-to-b from-white via-gray-50 to-gray-100">
        <div className="mx-auto container flex flex-col items-center justify-start space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold gradient-title">
              From equations to animations — effortlessly.
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're teaching, presenting, or creating content,
              ManimFlow turns your ideas into elegant motion.
            </p>
          </div>

{/* GRID */}
<div className="flex flex-col gap-32 w-full">
  {feat.map((f, index) => {
    const isVideo = f.link.endsWith(".mp4");

    return (
      <div
        key={index}
        className="group rounded-2xl  bg-linear-to-b from-white to-blue-50 border border-gray-200 shadow-sm 
                   hover:shadow-xl hover:border-indigo-300 transition-all duration-300 
                   bg-gray-300 backdrop-blur-sm"
      >
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-10 ${
            isVideo ? "" : "md:grid-flow-col-dense"
          }`}
        >
          {/* MEDIA — decides left/right */}
          {isVideo ? (
            // VIDEO LEFT
            <>
              <div className="w-full h-full flex items-center justify-center">
                <video
                  src={f.link}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="rounded-xl shadow-md w-full h-full object-cover"
                />
              </div>

              {/* TEXT RIGHT */}
              <div className="flex flex-col justify-center space-y-4 md:pr-6">
                <CardTitle>
                  <h3 className="text-2xl font-bold text-black">{f.title}</h3>
                </CardTitle>
                <CardDescription>
                  <p className="text-gray-600 font-medium">{f.subtitle}</p>
                </CardDescription>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            </>
          ) : (
            // IMAGE SHOULD APPEAR ON THE RIGHT
            <>
              {/* TEXT LEFT */}
              <div className="flex flex-col justify-center space-y-4 md:pl-6">
                <CardTitle>
                  <h3 className="text-2xl font-bold text-black">{f.title}</h3>
                </CardTitle>
                <CardDescription>
                  <p className="text-gray-600 font-medium">{f.subtitle}</p>
                </CardDescription>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>

              {/* IMAGE RIGHT */}
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={f.link}
                  alt={f.title}
                  className="rounded-xl shadow-md w-full h-full object-cover"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  })}
</div>



        </div>
      </section>

      <section>
        <Faqs />
      </section>
    </main>
    <footer className="w-full border-t bg-gradient-to-b from-white to-blue-50 border-black/10 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="font-black text-2xl tracking-tight">Mozaik</h2>
          <p className="text-sm text-black/60 mt-1">
            Turn your math ideas into crisp, animated Manim videos — instantly.
          </p>
        </div>
        <div className="text-center text-xs text-black/50">
          © {new Date().getFullYear()} Mozaik. Made with ❤️ by Blue Onion.
        </div>
      </div>
    </footer>
    </>
  );
}
