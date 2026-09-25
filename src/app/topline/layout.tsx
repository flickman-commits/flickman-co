import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Money Dinners | Know WTF is happening in your business",
  description:
    "A small group of business owners who look at their numbers together once a month. From the team behind Topline.",
};

export default function ToplineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
