import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SEO from "@/components/SEO";
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
      services: [],
      email: 'rabtmarketingcompany@gmail.com'
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
          email: 'rabtmarketingcompany@gmail.com',
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <SEO title="Client Onboarding — RABT Marketing" description="Seamless multi-step onboarding for new clients at RABT Marketing." />
      
      {/* Professional Header with RABT Branding */}
      <header className="pt-12 pb-8">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="brand-badge">
              <div className="size-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <span className="font-display text-2xl font-bold text-primary-foreground">R</span>
              </div>
            </div>
            <div>
              <h1 className="brand-text">RABT Marketing</h1>
              <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Creative Agency</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Step {step + 1} of {steps.length}</span>
              <span className="text-sm font-medium text-muted-foreground">{Math.round(pct)}% Complete</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>

          {/* Form Card */}
          <div className="form-card p-8 md:p-12">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {step === 0 && (
              <section className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-semibold mb-2">Tell us about your brand</h2>
                  <p className="text-muted-foreground">Let's start with the basics about your company</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="company" className="elegant-label">Company / Brand Name</Label>
                    <Input id="company" {...form.register('company')} placeholder="Acme Co." className="elegant-input" />
                    <p className="text-xs text-destructive mt-1.5">{form.formState.errors.company?.message}</p>
                  </div>
                  <div>
                    <Label htmlFor="website" className="elegant-label">Website <span className="text-muted-foreground">(optional)</span></Label>
                    <Input id="website" {...form.register('website')} placeholder="https://yourwebsite.com" className="elegant-input" />
                    <p className="text-xs text-destructive mt-1.5">{form.formState.errors.website?.message}</p>
                  </div>
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-semibold mb-2">What are your objectives?</h2>
                  <p className="text-muted-foreground">Help us understand your goals and preferred services</p>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="goals" className="elegant-label">Main Goals</Label>
                    <Textarea 
                      id="goals" 
                      rows={4} 
                      {...form.register('goals')} 
                      placeholder="Grow Instagram reach, launch brand campaign, boost conversions…" 
                      className="elegant-input min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-destructive mt-1.5">{form.formState.errors.goals?.message}</p>
                  </div>
                  <div>
                    <Label className="elegant-label">Marketing Plans <span className="text-muted-foreground">(Select all that interest you)</span></Label>
                    <div className="grid grid-cols-1 gap-3 mt-3">
                      {marketingPlans.map((plan) => (
                        <div key={plan.value} className="flex items-start space-x-3 p-5 border-2 border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-all duration-200 cursor-pointer shadow-sm">
                          <Checkbox
                            id={plan.value}
                            checked={selectedServices.includes(plan.value)}
                            onCheckedChange={(checked) => handleServiceChange(plan.value, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label htmlFor={plan.value} className="cursor-pointer block">
                              <div className="font-bold text-foreground mb-1">{plan.label}</div>
                              <div className="text-sm text-muted-foreground font-semibold">{plan.price}</div>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-destructive mt-1.5">{form.formState.errors.services?.message}</p>
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-semibold mb-2">Investment & Timeline</h2>
                  <p className="text-muted-foreground">Let's discuss your budget and when you'd like to start</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="budget" className="elegant-label">Monthly Investment Range</Label>
                    <Input id="budget" {...form.register('budget')} placeholder="₹20,000–₹50,000" className="elegant-input" />
                    <p className="text-xs text-destructive mt-1.5">{form.formState.errors.budget?.message}</p>
                  </div>
                  <div>
                    <Label htmlFor="timeline" className="elegant-label">Preferred Timeline</Label>
                    <Input id="timeline" {...form.register('timeline')} placeholder="e.g., Start next month" className="elegant-input" />
                    <p className="text-xs text-destructive mt-1.5">{form.formState.errors.timeline?.message}</p>
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-6 animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-semibold mb-2">Let's connect</h2>
                  <p className="text-muted-foreground">We're excited to learn more about your project</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="contactName" className="elegant-label">Your Name</Label>
                    <Input id="contactName" {...form.register('contactName')} placeholder="Jane Doe" className="elegant-input" />
                    <p className="text-xs text-destructive mt-1.5">{form.formState.errors.contactName?.message}</p>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="elegant-label">Phone Number</Label>
                    <Input id="phone" type="tel" inputMode="numeric" pattern="[6-9]\d{9}" {...form.register('phone')} placeholder="9876543210" className="elegant-input" />
                    <p className="text-xs text-destructive mt-1.5">{form.formState.errors.phone?.message}</p>
                  </div>
                  <div>
                    <Label htmlFor="email" className="elegant-label">Sending inquiry to</Label>
                    <div className="relative">
                      <Input 
                        id="email" 
                        type="email" 
                        value="rabtmarketingcompany@gmail.com" 
                        readOnly 
                        className="elegant-input bg-muted cursor-not-allowed font-bold text-primary"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="size-3 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="flex gap-4 pt-8 border-t border-border">
              {step > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={back}
                  className="px-8 h-12 rounded-xl font-medium"
                >
                  Back
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button 
                  type="button" 
                  variant="hero" 
                  onClick={next}
                  className="flex-1 h-12 rounded-xl font-semibold text-base hover-scale"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  variant="hero" 
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl font-semibold text-base hover-scale"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin size-4 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Inquiry'
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
