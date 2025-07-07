
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

    // Get customer email and push notification info
    const customerEmail = packageData.customers?.email || packageData.customers?.profiles?.email;
    
    // Get customer profile for push notifications
    const { data: customerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('push_token, push_notifications_enabled, notification_preferences')
      .eq('id', packageData.customers?.user_id)
      .single();

    if (profileError) {
      console.log('Could not fetch customer profile:', profileError);
    }
    
    if (!customerEmail && (!customerProfile?.push_token || !customerProfile?.push_notifications_enabled)) {
      console.log('No email or push notification available for customer');
      return new Response(
        JSON.stringify({ error: 'No communication method available for customer' }),
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

    console.log('Sending notifications - Email:', !!customerEmail, 'Push:', !!(customerProfile?.push_token && customerProfile?.push_notifications_enabled));

    const results = {
      email: { success: false, error: null as any },
      push: { success: false, error: null as any }
    };

    // Send email notification if available
    if (customerEmail) {
      try {
        // Check if this is an "in_transit" status change and get shipping invoice
        let attachmentData = null;
        let invoiceEmailContent = '';
        
        if (status === 'in_transit') {
          // Get shipping invoice for this package
          const { data: shippingInvoice, error: invoiceError } = await supabase
            .from('invoices')
            .select(`
              *,
              invoice_line_items (*)
            `)
            .eq('package_id', packageId)
            .eq('invoice_type', 'shipping_invoice')
            .eq('auto_generated', true)
            .single();
          
          if (!invoiceError && shippingInvoice) {
            // Create invoice content for email
            const lineItems = shippingInvoice.invoice_line_items || [];
            invoiceEmailContent = `
              <div style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                <h3>Shipping Invoice Details</h3>
                <p><strong>Invoice Number:</strong> ${shippingInvoice.invoice_number || 'Auto-Generated'}</p>
                <p><strong>Due Date:</strong> ${shippingInvoice.payment_due_date ? new Date(shippingInvoice.payment_due_date).toLocaleDateString() : 'N/A'}</p>
                <div style="margin-top: 10px;">
                  <h4>Charges:</h4>
                  <ul>
                    ${lineItems.map(item => 
                      `<li>${item.description}: $${item.total_amount?.toFixed(2) || '0.00'}</li>`
                    ).join('')}
                  </ul>
                  <p style="font-weight: bold; margin-top: 10px;">
                    Total Amount Due: $${shippingInvoice.total_amount?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 15px;">
                  Please settle this invoice within 30 days to avoid any delays in package delivery.
                </p>
              </div>
            `;
          }
        }
        
        // Add invoice content to email if available
        if (invoiceEmailContent) {
          htmlContent = htmlContent.replace('</body>', invoiceEmailContent + '</body>');
        }

        // Send email using Resend
        const emailResponse = await resend.emails.send({
          from: "YardPack <notifications@yardpack.com>",
          to: [customerEmail],
          subject: status === 'in_transit' && invoiceEmailContent ? 
            `${subject} - Shipping Invoice Attached` : subject,
          html: htmlContent,
          text: textContent,
        });

        if (emailResponse.error) {
          console.error('Email sending failed:', emailResponse.error);
          results.email.error = emailResponse.error;
        } else {
          console.log('Email sent successfully:', emailResponse.data);
          results.email.success = true;
        }
      } catch (error) {
        console.error('Email sending error:', error);
        results.email.error = error;
      }
    }

    // Send push notification if available and enabled
    if (customerProfile?.push_token && customerProfile?.push_notifications_enabled) {
      try {
        const pushMessage = `${packageData.tracking_number}: ${status.replace('_', ' ')}`;
        
        const pushResponse = await supabase.functions.invoke('send-push-notification', {
          body: {
            deviceToken: customerProfile.push_token,
            title: subject,
            body: pushMessage,
            data: {
              packageId: packageId,
              status: status,
              trackingNumber: packageData.tracking_number
            }
          }
        });

        if (pushResponse.error) {
          console.error('Push notification failed:', pushResponse.error);
          results.push.error = pushResponse.error;
        } else {
          console.log('Push notification sent successfully');
          results.push.success = true;
        }
      } catch (error) {
        console.error('Push notification error:', error);
        results.push.error = error;
      }
    }

    // If neither email nor push succeeded, return error
    if (!results.email.success && !results.push.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send notifications', 
          details: { email: results.email.error, push: results.push.error }
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        results: results,
        emailSent: results.email.success,
        pushSent: results.push.success,
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
