
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  packageId: string;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { packageId, status }: NotificationRequest = await req.json();
    
    console.log('Processing notification for package:', packageId, 'status:', status);

    // Get package details with customer info
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select(`
        *,
        customers (
          id,
          full_name,
          email,
          user_id,
          profiles:user_id (email)
        )
      `)
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      console.error('Package not found:', packageError);
      return new Response(
        JSON.stringify({ error: 'Package not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get customer email
    const customerEmail = packageData.customers?.email || packageData.customers?.profiles?.email;
    
    if (!customerEmail) {
      console.log('No email found for customer');
      return new Response(
        JSON.stringify({ error: 'No email found for customer' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get email template based on status
    const templateMap: { [key: string]: string } = {
      'received': 'package_received',
      'in_transit': 'package_in_transit',
      'arrived': 'package_arrived',
      'ready_for_pickup': 'package_ready_for_pickup',
      'picked_up': 'package_picked_up'
    };

    const templateName = templateMap[status];
    if (!templateName) {
      console.error('Unknown status:', status);
      return new Response(
        JSON.stringify({ error: 'Unknown package status' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_name', templateName)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      console.error('Template not found:', templateError);
      return new Response(
        JSON.stringify({ error: 'Email template not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Template variables
    const templateVars = {
      customer_name: packageData.customers?.full_name || 'Valued Customer',
      tracking_number: packageData.tracking_number,
      description: packageData.description,
      total_due: packageData.total_due || 0,
      pickup_address: 'YardPack Jamaica Facility, Kingston, Jamaica'
    };

    // Simple template replacement
    let htmlContent = template.html_content;
    let textContent = template.text_content || '';
    let subject = template.subject;

    Object.entries(templateVars).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
      textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value));
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Handle conditional content for total_due
    if (templateVars.total_due > 0) {
      htmlContent = htmlContent.replace(/{{#if total_due}}(.*?){{\/if}}/gs, '$1');
    } else {
      htmlContent = htmlContent.replace(/{{#if total_due}}(.*?){{\/if}}/gs, '');
    }

    console.log('Sending email to:', customerEmail);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "YardPack <notifications@yardpack.com>",
      to: [customerEmail],
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    if (emailResponse.error) {
      console.error('Email sending failed:', emailResponse.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailResponse.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Email sent successfully:', emailResponse.data);

    // Update notification record as sent and update package notification tracking
    const notificationUpdate = await supabase
      .from('notifications')
      .update({ sent_at: new Date().toISOString() })
      .eq('package_id', packageId)
      .eq('type', 'email')
      .is('sent_at', null);
    
    if (notificationUpdate.error) {
      console.error('Failed to update notification record:', notificationUpdate.error);
    }

    // Update package notification tracking
    const packageUpdate = await supabase
      .from('packages')
      .update({ 
        last_notification_status: status,
        last_notification_sent_at: new Date().toISOString()
      })
      .eq('id', packageId);
    
    if (packageUpdate.error) {
      console.error('Failed to update package notification tracking:', packageUpdate.error);
    }
    
    console.log('Notification tracking updated for package:', packageId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        recipient: customerEmail
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error in send-package-notification function:", error);
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
