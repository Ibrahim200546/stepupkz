-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Brands table
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand_id UUID REFERENCES public.brands(id),
  category_id UUID REFERENCES public.categories(id),
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants (sizes, colors)
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT,
  stock INTEGER DEFAULT 0,
  barcode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product images
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles (separate table for security)
CREATE TYPE public.app_role AS ENUM ('customer', 'manager', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Carts
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  shipping_method TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Indexes for performance
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_brand ON public.products(brand_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_reviews_product ON public.reviews(product_id);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Public can view brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view product variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);

-- Profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Cart policies
CREATE POLICY "Users can view their own cart" ON public.carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cart" ON public.carts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cart" ON public.carts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cart" ON public.carts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their cart items" ON public.cart_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);
CREATE POLICY "Users can add to their cart" ON public.cart_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);
CREATE POLICY "Users can update their cart items" ON public.cart_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);
CREATE POLICY "Users can delete their cart items" ON public.cart_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

-- Order policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Review policies
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own reviews" ON public.reviews FOR SELECT USING (auth.uid() = user_id OR is_approved = true);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can view their wishlist" ON public.wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to wishlist" ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from wishlist" ON public.wishlist FOR DELETE USING (auth.uid() = user_id);

-- Security function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policies for products management
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL USING (
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins can manage product variants" ON public.product_variants FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins can moderate reviews" ON public.reviews FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

-- Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();