-- Create vendor stats view for dashboard
CREATE OR REPLACE VIEW vendor_stats AS
SELECT 
  v.id,
  v.name,
  v.owner_id,
  COUNT(DISTINCT vp.id) as total_products,
  COALESCE(SUM(
    CASE 
      WHEN oi.created_at >= date_trunc('month', CURRENT_DATE)
      THEN oi.quantity * oi.price
      ELSE 0
    END
  ), 0) as monthly_sales,
  COUNT(DISTINCT CASE WHEN pv.created_at >= date_trunc('month', CURRENT_DATE) THEN pv.id END) as monthly_views,
  COUNT(DISTINCT o.id) as total_orders
FROM vendors v
LEFT JOIN vendor_products vp ON vp.vendor_id = v.id
LEFT JOIN products p ON p.id = vp.id
LEFT JOIN product_variants pv2 ON pv2.product_id = p.id
LEFT JOIN order_items oi ON oi.product_variant_id = pv2.id
LEFT JOIN orders o ON o.id = oi.order_id
LEFT JOIN product_views pv ON pv.product_id = p.id
GROUP BY v.id, v.name, v.owner_id;

-- Grant access to authenticated users
GRANT SELECT ON vendor_stats TO authenticated;

-- Enable RLS on view (users can only see their own stats)
CREATE POLICY "Vendors can view their own stats"
ON vendor_stats
FOR SELECT
TO authenticated
USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Create product_views table if not exists (for tracking)
CREATE TABLE IF NOT EXISTS public.product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now(),
  session_id text
);

-- Enable RLS
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can create views
CREATE POLICY "Anyone can track product views"
ON public.product_views
FOR INSERT
WITH CHECK (true);

-- Policy: admins can view all
CREATE POLICY "Admins can view all product views"
ON public.product_views
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_product_views_product_date 
ON public.product_views(product_id, viewed_at DESC);
