import Hero from "@/components/Hero";
import Goals from "@/components/Goals";
import Companies from "@/components/Companies";
import Blog from "@/components/Blog";
import MyApps from "@/components/MyApps";
import Footer from "@/components/Footer";
import InventoryBar from "@/components/InventoryBar";
import Jukebox from "@/components/Jukebox";
import { getSubstackPosts } from "@/lib/substack";
import { getTrackstarYTDRevenue } from "@/lib/shopify";

// Revalidate every hour — Shopify ARR is the most time-sensitive bit on the page.
export const revalidate = 3600;

export default async function Home() {
  const [posts, trackstarRevenue] = await Promise.all([
    getSubstackPosts(6),
    getTrackstarYTDRevenue(),
  ]);

  return (
    <>
      <main>
        <Hero />
        <Goals trackstarRevenue={trackstarRevenue} />
        <MyApps />
        <Companies />
        <Blog posts={posts} />
      </main>
      <Footer />
      <InventoryBar />
      <Jukebox />
    </>
  );
}
