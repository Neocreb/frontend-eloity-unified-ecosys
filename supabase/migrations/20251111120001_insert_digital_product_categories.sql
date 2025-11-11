-- Insert or update categories for digital products
-- This migration ensures the product_categories table has the right categories for digital and service products

INSERT INTO public.product_categories (name, slug, description, level, is_active, sort_order)
VALUES 
  ('Books & Literature', 'books-literature', 'eBooks, audiobooks, and other literary works', 1, true, 1),
  ('Education & Learning', 'education-learning', 'Educational materials, courses, and tutorials', 1, true, 2),
  ('Entertainment & Media', 'entertainment-media', 'Music, video, and other media files', 1, true, 3),
  ('Software & Apps', 'software-apps', 'Software applications and tools', 1, true, 4),
  ('Design & Templates', 'design-templates', 'Design templates, graphics, and creative assets', 1, true, 5),
  ('Music & Audio', 'music-audio', 'Music files, sound effects, and audio content', 1, true, 6),
  ('Business & Productivity', 'business-productivity', 'Business tools, productivity apps, and services', 1, true, 7),
  ('Gaming', 'gaming', 'Games, mods, and gaming-related content', 1, true, 8)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;