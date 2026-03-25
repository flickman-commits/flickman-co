import Hero from "@/components/Hero";
import Goals from "@/components/Goals";
import About from "@/components/About";
import Companies from "@/components/Companies";
import Blog from "@/components/Blog";
import ToolsStack from "@/components/ToolsStack";
import Footer from "@/components/Footer";
import InventoryBar from "@/components/InventoryBar";
import Jukebox from "@/components/Jukebox";
import { getSubstackPosts } from "@/lib/substack";

// Revalidate every 24 hours — Substack posts don't change frequently
export const revalidate = 86400;

export default async function Home() {
  const posts = await getSubstackPosts(6);

  return (
    <>
      <main>
        <Hero />
        <Goals />
        <About />
        <Companies />
        <Blog posts={posts} />
        <ToolsStack />
      </main>
      <Footer />
      <InventoryBar />
      <Jukebox />
    </>
  );
}
