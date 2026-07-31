import Nav from '@/components/nav';
import Hero from '@/components/hero';
import Features from '@/components/features';
import ParadoxSection from '@/components/paradox-section';
import HowItWorks from '@/components/how-it-works';
import CliSection from '@/components/cli-section';
import CtaSection from '@/components/cta-section';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="pointer-events-none fixed -top-[200px] -right-[150px] z-0 h-[500px] w-[500px] rounded-full bg-accent-glow blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-[100px] -left-[100px] z-0 h-[400px] w-[400px] rounded-full bg-indigo-dim blur-[120px]" />
      <div className="pointer-events-none fixed top-[30%] -left-[100px] z-0 h-[300px] w-[300px] rounded-full bg-accent-glow blur-[120px]" />
      <div className="relative z-10">
        <Nav />
        <main>
          <Hero />
          <Features />
          <ParadoxSection />
          <HowItWorks />
          <CliSection />
          <CtaSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
