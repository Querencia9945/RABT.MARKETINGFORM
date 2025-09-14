import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

    // Create formatted services list
    const selectedServices = services.map(service => {
      const plan = marketingPlans[service];
      return plan ? `${plan.label} (${plan.price})` : service;
    }).join('\n');

    // Send inquiry notification email to company
    const emailResponse = await resend.emails.send({
      from: "RABT Marketing <rabtmarketingcompany@gmail.com>",
      to: ["rabtmarketingcompany@gmail.com"],
      subject: `New Client Inquiry from ${company} - ${contactName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">🎯 New Client Inquiry Received!</h1>
          
          <p style="font-size: 16px; color: #555;">A new potential client has submitted an inquiry through your website.</p>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h2 style="color: #333; margin-top: 0; margin-bottom: 20px;">📋 Client Information</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #007bff;">Company Name:</strong>
              <span style="margin-left: 10px; font-size: 16px;">${company}</span>
            </div>
            
            ${website ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #007bff;">Website:</strong>
              <span style="margin-left: 10px;"><a href="${website}" target="_blank" style="color: #007bff;">${website}</a></span>
            </div>
            ` : ''}
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #007bff;">Contact Person:</strong>
              <span style="margin-left: 10px; font-size: 16px;">${contactName}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #007bff;">Email:</strong>
              <span style="margin-left: 10px;"><a href="mailto:${email}" style="color: #007bff;">${email}</a></span>
            </div>
            
            ${phone ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #007bff;">Phone:</strong>
              <span style="margin-left: 10px;"><a href="tel:${phone}" style="color: #007bff;">${phone}</a></span>
            </div>
            ` : ''}
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #007bff;">Budget:</strong>
              <span style="margin-left: 10px; font-size: 16px;">${budget}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #007bff;">Timeline:</strong>
              <span style="margin-left: 10px; font-size: 16px;">${timeline}</span>
            </div>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #333; margin-top: 0;">🎯 Business Goals</h3>
            <p style="margin: 0; font-size: 15px; line-height: 1.6;">${goals}</p>
          </div>
          
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h3 style="color: #333; margin-top: 0;">📦 Selected Services</h3>
            <div style="background-color: white; padding: 15px; border-radius: 4px;">
              ${selectedServices.split('\n').map(service => `<div style="margin-bottom: 8px; padding: 8px; background-color: #f8f9fa; border-radius: 4px;">• ${service}</div>`).join('')}
            </div>
          </div>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin-top: 0;">⚡ Next Steps</h3>
            <p style="margin: 10px 0; color: #155724;">
              <strong>Reply to this email</strong> or call <strong>${phone || email}</strong> to follow up with this inquiry.
            </p>
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              Recommended response time: Within 24 hours for best conversion rates.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This inquiry was automatically generated from your RABT Marketing website contact form.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Your inquiry has been sent successfully! Check your email for confirmation.",
      emailId: emailResponse.data?.id
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