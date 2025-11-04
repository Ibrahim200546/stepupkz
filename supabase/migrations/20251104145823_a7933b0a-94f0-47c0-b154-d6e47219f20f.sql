-- Add nickname and phone to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nickname text UNIQUE,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS nickname_updated_at timestamptz DEFAULT now();

-- Create index for nickname search
CREATE INDEX IF NOT EXISTS profiles_nickname_idx ON public.profiles (LOWER(nickname));

-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  phone text,
  address text,
  logo text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Vendors policies
CREATE POLICY "Vendors can view their own store"
ON public.vendors
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create vendor store"
ON public.vendors
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Vendors can update their own store"
ON public.vendors
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all vendors"
ON public.vendors
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can update vendors"
ON public.vendors
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Create vendor_products table
CREATE TABLE IF NOT EXISTS public.vendor_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category_id uuid REFERENCES public.categories(id),
  images text[],
  stock integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on vendor_products
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;

-- Vendor products policies
CREATE POLICY "Public can view active vendor products"
ON public.vendor_products
FOR SELECT
USING (is_active = true);

CREATE POLICY "Vendors can manage their products"
ON public.vendor_products
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.vendors
    WHERE vendors.id = vendor_products.vendor_id
    AND vendors.owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all vendor products"
ON public.vendor_products
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Add vendor role to app_role enum if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('admin', 'manager', 'vendor', 'customer');
    ELSE
        -- Check if vendor exists in enum
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'vendor' AND enumtypid = 'app_role'::regtype) THEN
            ALTER TYPE app_role ADD VALUE 'vendor';
        END IF;
    END IF;
END $$;

-- Update profiles RLS to allow users to search by nickname
CREATE POLICY "Users can search profiles by nickname"
ON public.profiles
FOR SELECT
USING (true);

-- Insert admin role for specified user
INSERT INTO public.user_roles (user_id, role)
VALUES ('1630609e-6eee-4601-ae63-9aad4a35972f', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Trigger to update vendors updated_at
CREATE OR REPLACE FUNCTION public.update_vendor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_vendor_updated_at();

CREATE TRIGGER update_vendor_products_updated_at
BEFORE UPDATE ON public.vendor_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();