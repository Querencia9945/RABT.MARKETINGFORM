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

    // Send confirmation email to the client
    const emailResponse = await resend.emails.send({
      from: "RABT Marketing <rabtmarketingcompany@gmail.com>",
      to: [email],
      subject: "Thank you for your inquiry - RABT Marketing",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Thank you for your inquiry!</h1>
          
          <p>Dear ${contactName},</p>
          
          <p>Thank you for reaching out to RABT Marketing. We have received your inquiry and our team will review your requirements carefully.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Your Inquiry Details:</h2>
            <p><strong>Company:</strong> ${company}</p>
            ${website ? `<p><strong>Website:</strong> ${website}</p>` : ''}
            <p><strong>Contact:</strong> ${contactName}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Goals:</strong> ${goals}</p>
            <p><strong>Budget:</strong> ${budget}</p>
            <p><strong>Timeline:</strong> ${timeline}</p>
            
            <h3 style="color: #333;">Selected Services:</h3>
            <pre style="background-color: white; padding: 15px; border-radius: 4px; white-space: pre-wrap; font-family: Arial, sans-serif;">${selectedServices}</pre>
          </div>
          
          <p>Our team will get back to you within 24 hours with a customized proposal that aligns with your business goals and budget.</p>
          
          <p>If you have any urgent questions, feel free to reply to this email or contact us directly.</p>
          
          <p>Best regards,<br>
          <strong>RABT Marketing Team</strong><br>
          Your Partner in Digital Growth</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">This email was sent from RABT Marketing Company. If you have any questions, please contact us at rabtmarketingcompany@gmail.com</p>
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