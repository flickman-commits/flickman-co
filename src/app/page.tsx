import Hero from "@/components/Hero";
import About from "@/components/About";
import Companies from "@/components/Companies";
import Blog from "@/components/Blog";
import ToolsStack from "@/components/ToolsStack";
import Footer from "@/components/Footer";
import InventoryBar from "@/components/InventoryBar";
import { getSubstackPosts } from "@/lib/substack";

// Revalidate every hour so new posts show up
export const revalidate = 3600;

export default async function Home() {
  const posts = await getSubstackPosts(6);

  return (
    <>
      <main>
        <Hero />
        <About />
        <Companies />
        <Blog posts={posts} />
        <ToolsStack />
      </main>
      <Footer />
      <InventoryBar />
    </>
  );
}
