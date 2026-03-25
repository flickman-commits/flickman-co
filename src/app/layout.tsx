import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Press_Start_2P } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Flickman & Co. | Simple (+ profitable) ideas, taken seriously.",
  description: "Matt Hickman — builder, creator, and explorer. Simple (+ profitable) ideas, taken seriously.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${pixelFont.variable} font-[family-name:var(--font-body)] bg-cream text-coal antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
