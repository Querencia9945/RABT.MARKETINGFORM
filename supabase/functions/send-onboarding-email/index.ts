import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OnboardingEmailRequest {
  company: string;
  website?: string;
  contactName: string;
  email: string;
  phone?: string;
  goals: string;
  services: string[];
  budget: string;
  timeline: string;
}

const marketingPlans: { [key: string]: { label: string; price: string } } = {
  'brand-building': { label: 'Brand Building Package', price: '₹25,000 - ₹50,000/month' },
  'digital-marketing': { label: 'Digital Marketing Suite', price: '₹35,000 - ₹75,000/month' },
  'full-management': { label: 'Full Marketing Management', price: '₹80,000 - ₹1,50,000/month' },
  'social-media': { label: 'Social Media Marketing', price: '₹15,000 - ₹35,000/month' },
  'content-creation': { label: 'Content Creation & Strategy', price: '₹20,000 - ₹45,000/month' },
  'influencer-marketing': { label: 'Influencer Marketing', price: '₹30,000 - ₹60,000/month' },
  'performance-marketing': { label: 'Performance Marketing', price: '₹40,000 - ₹90,000/month' },
  'custom': { label: 'Custom Package', price: 'Let\'s discuss your needs' }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      company,
      website,
      contactName,
      email,
      phone,
      goals,
      services,
      budget,
      timeline
    }: OnboardingEmailRequest = await req.json();

    console.log("Onboarding data received:", {
      company: company,
      contactName: contactName,
      email: email,
      services: services,
      budget: budget,
      timeline: timeline
    });

    // Email functionality removed - ready for new email service integration
    console.log("Email sending functionality has been removed. Ready for new integration.");

    return new Response(JSON.stringify({ 
      success: true,
      message: "Onboarding data received successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-onboarding-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);