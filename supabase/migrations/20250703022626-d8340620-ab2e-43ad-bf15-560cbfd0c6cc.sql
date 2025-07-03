-- Create manual notifications table for admin-sent messages
CREATE TABLE public.manual_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('individual', 'broadcast')),
  recipient_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  recipient_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
  subject TEXT NOT NULL,
  message_body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_manual_notifications_sender FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.manual_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage manual notifications
CREATE POLICY "Admins can manage manual notifications" 
ON public.manual_notifications 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Add manual message email template
INSERT INTO public.email_templates (template_name, subject, html_content, text_content, is_active)
VALUES (
  'manual_admin_message',
  '{{subject}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333; margin-bottom: 20px;">Message from {{company_name}}</h2>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      {{message_body}}
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #666; font-size: 14px;">
      This message was sent by an administrator. If you have any questions, please contact us.
    </p>
  </div>',
  '{{message_body}}

---
This message was sent by an administrator. If you have any questions, please contact us.',
  true
);