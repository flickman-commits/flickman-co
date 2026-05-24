import type { Metadata, Viewport } from "next";
import LongDistanceApp from "./LongDistanceApp";

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
  return <LongDistanceApp />;
}
