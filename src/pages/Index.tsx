import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import BrandingHero from "@/components/BrandingHero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="RABT Marketing — Creative Agency" description="Premium creative agency website with a seamless client onboarding flow." />
      <Navbar />
      <main>
        <BrandingHero />

        <section id="services" className="container mx-auto py-16 md:py-24">
          <h2 className="text-3xl md:text-4xl font-display mb-8">Services</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: 'Social Media', d: 'Always-on content, calendars, and growth.' },
              { t: 'Content Creation', d: 'Video, photo, graphics that convert.' },
              { t: 'Influencer Marketing', d: 'Creator collabs that feel real.' },
            ].map((s) => (
              <Card key={s.t} className="glass">
                <CardContent className="p-6">
                  <Badge className="mb-3" variant="secondary">{s.t}</Badge>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="about" className="container mx-auto py-16">
          <h2 className="text-3xl md:text-4xl font-display mb-4">Why brands choose us</h2>
          <p className="max-w-3xl text-muted-foreground">
            We combine strategic thinking with bold creativity. Our work blends classic taste with modern performance — delivering measurable results and unforgettable brand moments.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Index;
