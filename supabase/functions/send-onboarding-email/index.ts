import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "RABT Marketing <onboarding@resend.dev>";

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

    console.log("Processing onboarding submission for:", email);

    // Format selected services for email
    const selectedPlans = services.map(serviceKey => {
      const plan = marketingPlans[serviceKey];
      return `• ${plan?.label || serviceKey} - ${plan?.price || 'Custom pricing'}`;
    }).join('\n');

    // Send confirmation email to client
    const clientEmailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: ["rabtmarketingcompany@gmail.com"],
      subject: "Thank you for your interest in RABT Marketing!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; margin-bottom: 24px;">Thank you, ${contactName}!</h1>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
            We've received your onboarding submission for <strong>${company}</strong> and are excited to help you grow your brand.
          </p>
          
          <h2 style="color: #1f2937; margin-top: 32px; margin-bottom: 16px;">Your Selected Services:</h2>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <pre style="margin: 0; white-space: pre-wrap; color: #374151;">${selectedPlans}</pre>
          </div>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
            <strong>Budget Range:</strong> ${budget}<br>
            <strong>Timeline:</strong> ${timeline}
          </p>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
            Our team will review your requirements and get back to you within 24 hours to schedule a detailed consultation.
          </p>
          
          <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: 500;">
              📞 Need immediate assistance? WhatsApp us at +91-XXXXXXXXXX
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
            Best regards,<br>
            <strong>RABT Marketing Team</strong><br>
            Transforming Brands, Driving Results
          </p>
        </div>
      `,
    });

    // Send notification email to RABT Marketing team
    const teamEmailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: ["rabtmarketingcompany@gmail.com"],
      subject: `New Onboarding Submission: ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; margin-bottom: 24px;">New Client Onboarding 🎉</h1>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="color: #1f2937; margin-top: 0;">Company Details</h2>
            <p><strong>Company:</strong> ${company}</p>
            ${website ? `<p><strong>Website:</strong> <a href="${website}">${website}</a></p>` : ''}
            
            <h3 style="color: #1f2937; margin-top: 20px;">Contact Information</h3>
            <p><strong>Name:</strong> ${contactName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> <a href="tel:+91${phone}">+91 ${phone}</a></p>` : ''}
            
            <h3 style="color: #1f2937; margin-top: 20px;">Project Details</h3>
            <p><strong>Goals:</strong></p>
            <div style="background: white; padding: 12px; border-radius: 4px; margin: 8px 0;">
              ${goals.replace(/\n/g, '<br>')}
            </div>
            
            <p><strong>Selected Services:</strong></p>
            <div style="background: white; padding: 12px; border-radius: 4px; margin: 8px 0;">
              ${selectedPlans.replace(/\n/g, '<br>')}
            </div>
            
            <p><strong>Budget:</strong> ${budget}</p>
            <p><strong>Timeline:</strong> ${timeline}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 16px; border-radius: 8px;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              ⏰ Follow up within 24 hours for best conversion rates!
            </p>
          </div>
        </div>
      `,
    });

    // Send additional priority notification email
    const priorityEmailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: ["rabtmarketingcompany@gmail.com"],
      subject: `🚨 URGENT: New Lead - ${company} (${budget})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px;">🚨 NEW LEAD ALERT 🚨</h1>
          </div>
          
          <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin-bottom: 24px;">
            <h2 style="margin-top: 0; color: #0c4a6e;">Quick Summary</h2>
            <p style="margin: 8px 0;"><strong>Company:</strong> ${company}</p>
            <p style="margin: 8px 0;"><strong>Contact:</strong> ${contactName} (${email})</p>
            <p style="margin: 8px 0;"><strong>Budget:</strong> <span style="color: #dc2626; font-weight: bold;">${budget}</span></p>
            <p style="margin: 8px 0;"><strong>Timeline:</strong> ${timeline}</p>
            ${phone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:+91${phone}" style="color: #0ea5e9;">+91 ${phone}</a></p>` : ''}
          </div>
          
          <div style="background: #16a34a; color: white; padding: 12px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-weight: bold;">
              💰 Potential Revenue: ${budget} | ⏰ Contact within 2 hours!
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 24px; text-align: center;">
            This is an automated priority notification for high-value leads.
          </p>
        </div>
      `,
    });

    console.log("Emails sent successfully:", { clientEmailResponse, teamEmailResponse, priorityEmailResponse });

    return new Response(JSON.stringify({ 
      success: true,
      clientEmail: clientEmailResponse,
      teamEmail: teamEmailResponse 
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