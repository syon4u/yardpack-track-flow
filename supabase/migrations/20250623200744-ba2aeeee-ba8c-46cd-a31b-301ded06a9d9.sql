
-- Create enum types
CREATE TYPE public.package_status AS ENUM ('received', 'in_transit', 'arrived', 'ready_for_pickup', 'completed');
CREATE TYPE public.app_role AS ENUM ('customer', 'admin');
CREATE TYPE public.notification_type AS ENUM ('email', 'sms');

-- Create profiles table with additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create packages table with comprehensive tracking
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status package_status NOT NULL DEFAULT 'received',
  weight DECIMAL(10,2),
  dimensions TEXT, -- Store as "L x W x H"
  sender_name TEXT,
  sender_address TEXT,
  delivery_address TEXT NOT NULL,
  package_value DECIMAL(10,2), -- For duty calculation
  duty_rate DECIMAL(5,2) DEFAULT 0.15, -- 15% default duty rate
  duty_amount DECIMAL(10,2),
  total_due DECIMAL(10,2),
  date_received TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table for multiple invoice uploads per package
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  recipient TEXT NOT NULL, -- email address or phone number
  subject TEXT,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for packages
CREATE POLICY "Customers can view their own packages" ON public.packages FOR SELECT USING (
  customer_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert packages" ON public.packages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update packages" ON public.packages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices for their packages" ON public.invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.packages WHERE id = package_id AND customer_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can upload invoices for their packages" ON public.invoices FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.packages WHERE id = package_id AND customer_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_packages_updated_at BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone_number', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate duty automatically
CREATE OR REPLACE FUNCTION public.calculate_package_duty()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate duty if package value is provided and duty_amount is not manually set
  IF NEW.package_value IS NOT NULL AND (OLD.duty_amount IS NULL OR NEW.package_value != COALESCE(OLD.package_value, 0)) THEN
    NEW.duty_amount = NEW.package_value * NEW.duty_rate;
    NEW.total_due = NEW.duty_amount;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic duty calculation
CREATE TRIGGER calculate_duty_trigger
  BEFORE INSERT OR UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.calculate_package_duty();

-- Create storage bucket for invoice files
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false);

-- Storage policies for invoices bucket
CREATE POLICY "Users can upload invoices" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'invoices' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR 
   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);

CREATE POLICY "Users can view invoices" ON storage.objects FOR SELECT USING (
  bucket_id = 'invoices' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR 
   EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);
