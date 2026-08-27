import Hero from '../components/public/Hero';
import Features from '../components/public/Features';
import HowItWorks from '../components/public/HowItWorks';
import AboutSection from '../components/public/AboutSection';
import WhyChooseUs from '../components/public/WhyChooseUs';
import Support from '../components/public/Support';
import FAQs from '../components/public/FAQs';
import CTASection from '../components/public/CTASection';
import Footer from '../components/public/Footer';

export default function Home() {
  return (
    <div className="animate-fade-in">
      <Hero />
      <Features />
      <HowItWorks />
      <AboutSection />
      <WhyChooseUs />
      <Support />
      <FAQs />
      <CTASection />
      <Footer />
    </div>
  );
}