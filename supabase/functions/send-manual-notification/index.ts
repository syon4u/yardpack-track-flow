import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ManualNotificationRequest {
  recipientType: 'individual' | 'broadcast';
  recipientIds?: string[];
  subject: string;
  messageBody: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { 
        autoRefreshToken: false, 
        persistSession: false 
      }
    });

    // Get user from auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error("Admin access required");
    }

    const { recipientType, recipientIds, subject, messageBody }: ManualNotificationRequest = await req.json();

    let recipients: Array<{id: string, email: string, name: string}> = [];

    if (recipientType === 'broadcast') {
      // Get all customers with email addresses
      const { data: customers } = await supabase
        .from('customers')
        .select(`
          id, 
          email, 
          full_name,
          user_id,
          profiles:user_id(email)
        `);

      recipients = customers?.map(customer => ({
        id: customer.id,
        email: customer.email || customer.profiles?.email || '',
        name: customer.full_name
      })).filter(r => r.email) || [];
    } else {
      // Get specific customers
      const { data: customers } = await supabase
        .from('customers')
        .select(`
          id, 
          email, 
          full_name,
          user_id,
          profiles:user_id(email)
        `)
        .in('id', recipientIds || []);

      recipients = customers?.map(customer => ({
        id: customer.id,
        email: customer.email || customer.profiles?.email || '',
        name: customer.full_name
      })).filter(r => r.email) || [];
    }

    if (recipients.length === 0) {
      throw new Error("No valid recipients found");
    }

    // Get email template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_name', 'manual_admin_message')
      .eq('is_active', true)
      .single();

    if (!template) {
      throw new Error("Email template not found");
    }

    // Send emails
    const emailPromises = recipients.map(async (recipient) => {
      const htmlContent = template.html_content
        .replace('{{subject}}', subject)
        .replace('{{message_body}}', messageBody.replace(/\n/g, '<br>'))
        .replace('{{company_name}}', 'Package Management System');

      const textContent = template.text_content
        .replace('{{message_body}}', messageBody);

      try {
        await resend.emails.send({
          from: "Package System <onboarding@resend.dev>",
          to: [recipient.email],
          subject: subject,
          html: htmlContent,
          text: textContent,
        });
        return { success: true, recipient: recipient.email };
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        return { success: false, recipient: recipient.email, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Log the manual notification
    await supabase
      .from('manual_notifications')
      .insert({
        sender_id: user.id,
        recipient_type: recipientType,
        recipient_ids: recipients.map(r => r.id),
        recipient_emails: recipients.map(r => r.email),
        subject,
        message_body: messageBody,
      });

    console.log(`Manual notification sent: ${successful.length} successful, ${failed.length} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        totalRecipients: recipients.length,
        successful: successful.length,
        failed: failed.length,
        failedRecipients: failed.map(f => f.recipient)
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-manual-notification function:", error);
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