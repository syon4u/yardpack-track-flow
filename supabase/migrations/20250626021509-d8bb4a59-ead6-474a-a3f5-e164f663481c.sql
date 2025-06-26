
-- Add email notification tracking
ALTER TABLE public.packages 
ADD COLUMN last_notification_status package_status,
ADD COLUMN last_notification_sent_at TIMESTAMP WITH TIME ZONE;

-- Create email templates table for customizable notifications
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email templates
CREATE POLICY "Only admins can manage email templates" ON public.email_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default email templates for each package status
INSERT INTO public.email_templates (template_name, subject, html_content, text_content) VALUES
('package_received', 'Package Received - {{tracking_number}}', 
 '<h2>Your Package Has Been Received</h2><p>Dear {{customer_name}},</p><p>We have received your package with tracking number <strong>{{tracking_number}}</strong> at our Miami facility.</p><p><strong>Description:</strong> {{description}}</p><p>We will notify you when your package is ready for the next stage.</p><p>Best regards,<br>YardPack Team</p>',
 'Your Package Has Been Received\n\nDear {{customer_name}},\n\nWe have received your package with tracking number {{tracking_number}} at our Miami facility.\n\nDescription: {{description}}\n\nWe will notify you when your package is ready for the next stage.\n\nBest regards,\nYardPack Team'),
 
('package_in_transit', 'Package In Transit - {{tracking_number}}', 
 '<h2>Your Package Is In Transit</h2><p>Dear {{customer_name}},</p><p>Your package with tracking number <strong>{{tracking_number}}</strong> is now in transit to Jamaica.</p><p><strong>Description:</strong> {{description}}</p><p>Expected arrival: We will update you once it arrives at our Jamaica facility.</p><p>Best regards,<br>YardPack Team</p>',
 'Your Package Is In Transit\n\nDear {{customer_name}},\n\nYour package with tracking number {{tracking_number}} is now in transit to Jamaica.\n\nDescription: {{description}}\n\nExpected arrival: We will update you once it arrives at our Jamaica facility.\n\nBest regards,\nYardPack Team'),
 
('package_arrived', 'Package Arrived in Jamaica - {{tracking_number}}', 
 '<h2>Your Package Has Arrived in Jamaica</h2><p>Dear {{customer_name}},</p><p>Great news! Your package with tracking number <strong>{{tracking_number}}</strong> has arrived at our Jamaica facility.</p><p><strong>Description:</strong> {{description}}</p><p>We are now processing your package for customs clearance. You will be notified once it is ready for pickup.</p><p>Best regards,<br>YardPack Team</p>',
 'Your Package Has Arrived in Jamaica\n\nDear {{customer_name}},\n\nGreat news! Your package with tracking number {{tracking_number}} has arrived at our Jamaica facility.\n\nDescription: {{description}}\n\nWe are now processing your package for customs clearance. You will be notified once it is ready for pickup.\n\nBest regards,\nYardPack Team'),
 
('package_ready_for_pickup', 'Package Ready for Pickup - {{tracking_number}}', 
 '<h2>Your Package Is Ready for Pickup</h2><p>Dear {{customer_name}},</p><p>Your package with tracking number <strong>{{tracking_number}}</strong> has cleared customs and is ready for pickup!</p><p><strong>Description:</strong> {{description}}</p>{{#if total_due}}<p><strong>Amount Due:</strong> ${{total_due}}</p>{{/if}}<p><strong>Pickup Location:</strong> {{pickup_address}}</p><p><strong>Pickup Hours:</strong> Monday - Friday: 9:00 AM - 5:00 PM, Saturday: 9:00 AM - 2:00 PM</p><p>Please bring a valid ID and be prepared to pay any outstanding duties or fees.</p><p>Best regards,<br>YardPack Team</p>',
 'Your Package Is Ready for Pickup\n\nDear {{customer_name}},\n\nYour package with tracking number {{tracking_number}} has cleared customs and is ready for pickup!\n\nDescription: {{description}}\n\nAmount Due: ${{total_due}}\n\nPickup Location: {{pickup_address}}\nPickup Hours: Monday - Friday: 9:00 AM - 5:00 PM, Saturday: 9:00 AM - 2:00 PM\n\nPlease bring a valid ID and be prepared to pay any outstanding duties or fees.\n\nBest regards,\nYardPack Team'),
 
('package_picked_up', 'Package Delivered - {{tracking_number}}', 
 '<h2>Package Successfully Delivered</h2><p>Dear {{customer_name}},</p><p>Your package with tracking number <strong>{{tracking_number}}</strong> has been successfully picked up and delivered.</p><p><strong>Description:</strong> {{description}}</p><p>Thank you for choosing YardPack for your shipping needs. We hope to serve you again soon!</p><p>Best regards,<br>YardPack Team</p>',
 'Package Successfully Delivered\n\nDear {{customer_name}},\n\nYour package with tracking number {{tracking_number}} has been successfully picked up and delivered.\n\nDescription: {{description}}\n\nThank you for choosing YardPack for your shipping needs. We hope to serve you again soon!\n\nBest regards,\nYardPack Team');

-- Add trigger for updated_at on email_templates
CREATE TRIGGER handle_email_templates_updated_at 
  BEFORE UPDATE ON public.email_templates 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to trigger email notifications on package status change
CREATE OR REPLACE FUNCTION public.trigger_package_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status actually changed and customer has email
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Insert notification record
    INSERT INTO public.notifications (
      user_id,
      package_id, 
      type,
      recipient,
      subject,
      message
    )
    SELECT 
      c.user_id,
      NEW.id,
      'email'::notification_type,
      COALESCE(c.email, p.email),
      'Package Status Update - ' || NEW.tracking_number,
      'Your package status has been updated to: ' || NEW.status
    FROM public.customers c
    LEFT JOIN public.profiles p ON p.id = c.user_id
    WHERE c.id = NEW.customer_id 
    AND (c.email IS NOT NULL OR p.email IS NOT NULL);

    -- Update the last notification tracking
    NEW.last_notification_status = NEW.status;
    NEW.last_notification_sent_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for package status changes
CREATE TRIGGER package_status_notification_trigger
  BEFORE UPDATE ON public.packages
  FOR EACH ROW 
  EXECUTE FUNCTION public.trigger_package_notification();
