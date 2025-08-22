
-- Create feature flags table for e-commerce toggle
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert the ecommerce feature flag (disabled by default)
INSERT INTO public.feature_flags (flag_name, is_enabled) VALUES ('ecommerce', true);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  price_inr INTEGER NOT NULL, -- Store in paise (1 rupee = 100 paise)
  stock INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create carts table
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price_inr INTEGER NOT NULL, -- Store in paise
  subtotal_inr INTEGER NOT NULL, -- Store in paise
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cart_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items_json JSONB NOT NULL,
  subtotal_inr INTEGER NOT NULL, -- Store in paise
  discount_due_coins INTEGER NOT NULL DEFAULT 0,
  tax_inr INTEGER NOT NULL DEFAULT 0, -- Store in paise
  shipping_inr INTEGER NOT NULL DEFAULT 0, -- Store in paise
  total_payable_inr INTEGER NOT NULL, -- Store in paise
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create wallet_ledger table for audit trail
CREATE TABLE public.wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta_coins INTEGER NOT NULL, -- Can be positive or negative
  reason TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_carts_user_status ON public.carts(user_id, status);
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_wallet_ledger_user_id ON public.wallet_ledger(user_id);

-- Enable Row Level Security
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_flags (readable by all authenticated users)
CREATE POLICY "Users can view feature flags" ON public.feature_flags
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for products (readable by all authenticated users)
CREATE POLICY "Users can view active products" ON public.products
  FOR SELECT USING (auth.uid() IS NOT NULL AND active = true);

-- RLS Policies for carts (users can only access their own carts)
CREATE POLICY "Users can view their own carts" ON public.carts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own carts" ON public.carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carts" ON public.carts
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for cart_items (users can only access items from their own carts)
CREATE POLICY "Users can view their own cart items" ON public.cart_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.carts 
      WHERE carts.id = cart_items.cart_id 
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.carts 
      WHERE carts.id = cart_items.cart_id 
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own cart items" ON public.cart_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.carts 
      WHERE carts.id = cart_items.cart_id 
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own cart items" ON public.cart_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.carts 
      WHERE carts.id = cart_items.cart_id 
      AND carts.user_id = auth.uid()
    )
  );

-- RLS Policies for orders (users can only access their own orders)
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for wallet_ledger (users can only view their own transactions)
CREATE POLICY "Users can view their own wallet transactions" ON public.wallet_ledger
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet transactions" ON public.wallet_ledger
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert some sample products for testing
INSERT INTO public.products (title, description, images, price_inr, stock) VALUES
  ('Productivity Planner', 'A beautiful planner to boost your productivity', ARRAY['/placeholder.svg'], 99900, 50), -- ₹999.00
  ('Focus Timer', 'Digital timer for the Pomodoro technique', ARRAY['/placeholder.svg'], 249900, 25), -- ₹2499.00
  ('Motivational Notebook', 'High-quality notebook with inspiring quotes', ARRAY['/placeholder.svg'], 49900, 100), -- ₹499.00
  ('Task Completion Certificate', 'Printable certificate for completed goals', ARRAY['/placeholder.svg'], 9900, 1000), -- ₹99.00
  ('Premium Course Access', 'Access to our premium productivity course', ARRAY['/placeholder.svg'], 499900, 10); -- ₹4999.00

-- Create function to get or create active cart for user
CREATE OR REPLACE FUNCTION public.get_or_create_cart(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cart_id UUID;
BEGIN
  -- Try to get existing draft cart
  SELECT id INTO cart_id
  FROM public.carts
  WHERE user_id = p_user_id AND status = 'draft'
  LIMIT 1;
  
  -- If no cart exists, create one
  IF cart_id IS NULL THEN
    INSERT INTO public.carts (user_id, status)
    VALUES (p_user_id, 'draft')
    RETURNING id INTO cart_id;
  END IF;
  
  RETURN cart_id;
END;
$$;

-- Create function to calculate Due Coins usage
CREATE OR REPLACE FUNCTION public.calculate_due_coins_usage(
  p_subtotal_inr INTEGER,
  p_user_balance INTEGER,
  p_requested_coins INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  max_redeemable INTEGER;
  coins_used INTEGER;
  result JSON;
BEGIN
  -- Calculate 15% cap (in coins, where 1 coin = 100 paise = ₹1)
  max_redeemable := FLOOR(0.15 * p_subtotal_inr / 100);
  
  -- Determine actual coins to use
  IF p_requested_coins IS NULL THEN
    coins_used := LEAST(p_user_balance, max_redeemable);
  ELSE
    coins_used := LEAST(p_requested_coins, LEAST(p_user_balance, max_redeemable));
  END IF;
  
  -- Ensure non-negative
  coins_used := GREATEST(coins_used, 0);
  
  result := json_build_object(
    'subtotal_inr', p_subtotal_inr,
    'max_redeemable_coins', max_redeemable,
    'user_balance_coins', p_user_balance,
    'coins_used', coins_used,
    'discount_inr', coins_used * 100, -- Convert coins to paise
    'payable_before_tax_shipping_inr', GREATEST(p_subtotal_inr - (coins_used * 100), 0)
  );
  
  RETURN result;
END;
$$;
