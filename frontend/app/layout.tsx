import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
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
    <ClerkProvider appearance={{}}>
      <html lang="en" className={`${archivoBlack.variable} ${inter.className}`}>
        <body className="relative text-black">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
