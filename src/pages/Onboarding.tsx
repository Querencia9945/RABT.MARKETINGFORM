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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  company: z.string().min(2, 'Company name is required'),
  website: z.string().url('Provide a valid URL').optional().or(z.literal('')),
  contactName: z.string().min(2, 'Your name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number'),
  goals: z.string().min(10, 'Tell us a bit more about your goals'),
  services: z.array(z.string()).min(1, 'Please select at least one marketing plan'),
  budget: z.string().min(1, 'Budget is required'),
  timeline: z.string().min(1, 'Timeline is required'),
});

const marketingPlans = [
  { value: 'brand-building', label: 'Brand Building Package', price: '₹25,000 - ₹50,000/month' },
  { value: 'digital-marketing', label: 'Digital Marketing Suite', price: '₹35,000 - ₹75,000/month' },
  { value: 'full-management', label: 'Full Marketing Management', price: '₹80,000 - ₹1,50,000/month' },
  { value: 'social-media', label: 'Social Media Marketing', price: '₹15,000 - ₹35,000/month' },
  { value: 'content-creation', label: 'Content Creation & Strategy', price: '₹20,000 - ₹45,000/month' },
  { value: 'influencer-marketing', label: 'Influencer Marketing', price: '₹30,000 - ₹60,000/month' },
  { value: 'performance-marketing', label: 'Performance Marketing', price: '₹40,000 - ₹90,000/month' },
  { value: 'custom', label: 'Custom Package', price: 'Let\'s discuss your needs' }
];

type FormData = z.infer<typeof schema>;

const steps = ["Brand", "Objectives", "Plan", "Contact"] as const;

const Onboarding = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<FormData>({ 
    resolver: zodResolver(schema), 
    mode: 'onTouched',
    defaultValues: {
      services: []
    }
  });

  const next = async () => {
    // Only validate fields for the current step
    const fieldsToValidate = [
      ['company', 'website'] as (keyof FormData)[],
      ['goals', 'services'] as (keyof FormData)[],  
      ['budget', 'timeline'] as (keyof FormData)[],
      ['contactName', 'email', 'phone'] as (keyof FormData)[]
    ][step];
    
    const valid = await form.trigger(fieldsToValidate);
    if (!valid) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      // Store in Supabase database
      const { error: dbError } = await supabase
        .from('onboarding_submissions')
        .insert({
          company: values.company,
          website: values.website || null,
          contact_name: values.contactName,
          email: values.email,
          phone: values.phone,
          goals: values.goals,
          selected_services: values.services,
          budget: values.budget,
          timeline: values.timeline
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save submission');
      }

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-onboarding-email', {
        body: {
          ...values,
          services: values.services
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't throw error for email, as data is already saved
      }

      toast({ 
        title: 'Onboarding submitted successfully!', 
        description: 'We received your details and will reach out shortly.' 
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({ 
        title: 'Submission failed', 
        description: 'Please try again or contact us directly.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceChange = (serviceValue: string, checked: boolean) => {
    let newServices = [...selectedServices];
    if (checked) {
      newServices.push(serviceValue);
    } else {
      newServices = newServices.filter(s => s !== serviceValue);
    }
    setSelectedServices(newServices);
    form.setValue('services', newServices);
  };

  const pct = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen">
      <SEO title="Client Onboarding — RABT Marketing" description="Seamless multi-step onboarding for new clients at RABT Marketing." />
      <Navbar />
      <main className="container mx-auto py-10">
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
                <Label htmlFor="website">Website (optional)</Label>
                <Input id="website" {...form.register('website')} placeholder="https://yourwebsite.com" />
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
                <Label>Marketing Plans (Select all that interest you)</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {marketingPlans.map((plan) => (
                    <div key={plan.value} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                      <Checkbox
                        id={plan.value}
                        checked={selectedServices.includes(plan.value)}
                        onCheckedChange={(checked) => handleServiceChange(plan.value, checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={plan.value} className="cursor-pointer">
                          <div className="font-medium">{plan.label}</div>
                          <div className="text-xs text-muted-foreground">{plan.price}</div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{form.formState.errors.services?.message}</p>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="grid md:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <Label htmlFor="budget">Monthly budget (range)</Label>
                <Input id="budget" {...form.register('budget')} placeholder="₹20,000–₹50,000" />
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
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" inputMode="numeric" pattern="[6-9]\d{9}" {...form.register('phone')} placeholder="9876543210" />
                <p className="text-xs text-muted-foreground mt-1">{form.formState.errors.phone?.message}</p>
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
              <Button type="submit" variant="hero" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default Onboarding;
