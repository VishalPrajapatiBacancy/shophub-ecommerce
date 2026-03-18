-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  link_type TEXT DEFAULT 'none' CHECK (link_type IN ('product', 'category', 'url', 'none')),
  link_value TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Insert sample banners
INSERT INTO public.banners (title, image_url, link_type, sort_order, is_active) VALUES
  ('Summer Sale - Up to 50% Off', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', 'url', 1, true),
  ('New Arrivals - Fashion Collection', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200', 'category', 2, true),
  ('Electronics Mega Sale', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200', 'category', 3, true)
ON CONFLICT DO NOTHING;
