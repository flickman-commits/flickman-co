import type { Metadata, Viewport } from "next";
import HandwritingApp from "./HandwritingApp";

export const metadata: Metadata = {
  title: "My Handwriting Font | Flickman",
  description: "Turn your handwriting into a real, downloadable font.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function HandwritingPage() {
  return <HandwritingApp />;
}
