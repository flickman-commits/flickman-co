import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Money Lunches | Is your business actually making money?",
  description:
    "Once a month, a small room of business owners opens their books together. Topline presents Money Lunches.",
};

export default function ToplineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
