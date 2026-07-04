import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ClientLogos from "@/components/ClientLogos";
import Services from "@/components/Services";
import Industries from "@/components/Industries";
import Solutions from "@/components/Solutions";
import Process from "@/components/Process";
import WhyAraaye from "@/components/WhyAraaye";
import RealPortfolio from "@/components/RealPortfolio";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pb-20 sm:pb-0">
        <Hero />
        <ClientLogos />
        <Services />
        <Industries />
        <Solutions />
        <Process />
        <WhyAraaye />
        <RealPortfolio />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
