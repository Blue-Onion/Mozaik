import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mozaik — Manim Video Generator",
  description:
    "Mozaik is an AI-powered Manim code generator that transforms your math concepts into stunning animated videos effortlessly.",
  keywords: [
    "Manim",
    "video generator",
    "math animation",
    "AI",
    "code to video",
    "Next.js",
    "Mozaik",
  ],
  authors: [{ name: "Blue Onion" }],

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${archivoBlack.variable}`}>
      <body className="bg-[#0d1117] text-white antialiased">
        {children}
      </body>
    </html>
  );
}