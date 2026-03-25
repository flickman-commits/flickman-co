import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Companies from "@/components/Companies";
import Blog from "@/components/Blog";
import Footer from "@/components/Footer";
import InventoryBar from "@/components/InventoryBar";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Companies />
        <Blog />
      </main>
      <Footer />
      <InventoryBar />
    </>
  );
}
