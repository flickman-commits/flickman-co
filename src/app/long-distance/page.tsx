import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import LongDistanceApp from "./LongDistanceApp";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair-ldl",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Long Distance Loves",
  description:
    "Daily rituals to help long-distance couples feel close — and eventually close the gap.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function LongDistancePage() {
  return (
    <div className={playfair.variable} style={{ height: "100%" }}>
      <LongDistanceApp />
    </div>
  );
}
