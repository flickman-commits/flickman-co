import type { Metadata, Viewport } from "next";
import BottomLineApp from "./BottomLineApp";

export const metadata: Metadata = {
  title: "Bottom Line",
  description:
    "A game about the P&L. Run a lemonade stand, a burger joint, a gym. Every tap moves a line on the scoreboard.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function BottomLinePage() {
  return <BottomLineApp />;
}
