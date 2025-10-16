import Hero from "../components/landing/Hero";
import Vision from "../components/landing/Vision";
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Hero />
      <Vision />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
