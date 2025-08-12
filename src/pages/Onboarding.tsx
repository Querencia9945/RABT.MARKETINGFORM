import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  company: z.string().min(2, 'Company name is required'),
  website: z.string().url('Provide a valid URL').optional().or(z.literal('')),
  contactName: z.string().min(2, 'Your name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  goals: z.string().min(10, 'Tell us a bit more about your goals'),
  services: z.string().min(3),
  budget: z.string().min(1),
  timeline: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const steps = ["Brand", "Objectives", "Plan", "Contact"] as const;

const Onboarding = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const form = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onTouched' });

  const next = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const onSubmit = (values: FormData) => {
    // For now, just show a success toast and download JSON summary
    const blob = new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding_${values.company || 'brand'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Onboarding submitted', description: 'We received your details. We will reach out shortly.' });
  };

  const pct = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen">
      <SEO title="Client Onboarding — RABT Marketing" description="Seamless multi-step onboarding for new clients at RABT Marketing." />
      <Navbar />
      <main className="container mx-auto py-10">
        <h1 className="font-display text-3xl md:text-4xl mb-2">Client Onboarding</h1>
        <p className="text-muted-foreground mb-6">Tell us about your brand — it takes 2–3 minutes.</p>
        <Progress value={pct} className="mb-8" />

        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
          {step === 0 && (
            <section className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="company">Company / Brand</Label>
                <Input id="company" {...form.register('company')} placeholder="Acme Co." />
                <p className="text-xs text-muted-foreground mt-1">{form.formState.errors.company?.message}</p>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" {...form.register('website')} placeholder="https://" />
                <p className="text-xs text-muted-foreground mt-1">{form.formState.errors.website?.message}</p>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="goals">Main goals</Label>
                <Textarea id="goals" rows={4} {...form.register('goals')} placeholder="Grow Instagram reach, launch brand campaign, boost conversions…" />
                <p className="text-xs text-muted-foreground mt-1">{form.formState.errors.goals?.message}</p>
              </div>
              <div>
                <Label htmlFor="services">Services you need</Label>
                <Input id="services" {...form.register('services')} placeholder="Social media, Content creation, Influencer marketing" />
                <p className="text-xs text-muted-foreground mt-1">{form.formState.errors.services?.message}</p>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="grid md:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <Label htmlFor="budget">Monthly budget (range)</Label>
                <Input id="budget" {...form.register('budget')} placeholder="$2k–$5k" />
                <p className="text-xs text-muted-foreground mt-1">{form.formState.errors.budget?.message}</p>
              </div>
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input id="timeline" {...form.register('timeline')} placeholder="e.g., Start next month" />
                <p className="text-xs text-muted-foreground mt-1">{form.formState.errors.timeline?.message}</p>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="contactName">Your name</Label>
                <Input id="contactName" {...form.register('contactName')} placeholder="Jane Doe" />
                <p className="text-xs text-muted-foreground mt-1">{form.formState.errors.contactName?.message}</p>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email')} placeholder="you@company.com" />
                <p className="text-xs text-muted-foreground mt-1">{form.formState.errors.email?.message}</p>
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" {...form.register('phone')} placeholder="+1 555 000 1234" />
              </div>
            </section>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={back}>Back</Button>
            )}
            {step < steps.length - 1 ? (
              <Button type="button" variant="hero" onClick={next}>Next</Button>
            ) : (
              <Button type="submit" variant="hero">Submit</Button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default Onboarding;
