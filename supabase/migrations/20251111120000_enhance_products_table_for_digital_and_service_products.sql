-- Enhance products table with additional fields for digital and service products
-- This migration adds columns to support the enhanced product listing feature

-- Add columns for digital products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS digital_type VARCHAR(20);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS system_requirements TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS support_info TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS file_size VARCHAR(20);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS format VARCHAR(20);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS authors TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS publisher TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS publication_date DATE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS language VARCHAR(50);

-- Add columns for service products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS service_type VARCHAR(20);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_time VARCHAR(50);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS requirements TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_digital_type ON public.products (digital_type);
CREATE INDEX IF NOT EXISTS idx_products_service_type ON public.products (service_type);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);