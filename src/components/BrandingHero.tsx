import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BrandingHero = () => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current;
    if (!r) return;
    const rect = r.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    r.style.setProperty('--mx', `${x}px`);
    r.style.setProperty('--my', `${y}px`);
  };

  return (
    <section onMouseMove={onMove} ref={ref} className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-50" style={{
        background: `radial-gradient(600px circle at var(--mx,50%) var(--my,50%), hsl(var(--brand-pink)/0.25), transparent 60%)`
      }} />

      <div className="container mx-auto py-20 md:py-28">
        <p className="uppercase tracking-widest text-sm text-muted-foreground animate-fade-in">Creative Agency</p>
        <h1 className="mt-3 text-4xl md:text-6xl font-display leading-tight">
          <span className="text-gradient">Your brand</span> — our direction
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Content is the key. We craft strategy, content, and campaigns that grow your reach and revenue.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/onboarding">
            <Button variant="hero" size="lg" className="hover-scale">Start Onboarding</Button>
          </Link>
          <a href="#services">
            <Button variant="outline" size="lg">Explore Services</Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default BrandingHero;
