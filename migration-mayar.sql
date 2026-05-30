-- ============================================
-- Migration: Add Mayar.id Payment Gateway columns
-- Run this in Supabase SQL Editor BEFORE deploying
-- ============================================

-- Add Mayar-specific columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mayar_invoice_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS mayar_payment_url TEXT;

-- Create index for faster webhook lookups by Mayar invoice ID
CREATE INDEX IF NOT EXISTS idx_orders_mayar_invoice_id ON orders(mayar_invoice_id) WHERE mayar_invoice_id IS NOT NULL;

-- NOTE: We keep the old Louvin columns for backward compatibility with existing orders:
-- louvin_transaction_id, payment_qr_string, payment_va_number, payment_expiry
-- These can be dropped later once all pending Louvin orders are settled.

-- Optional: If you want to clean up old columns later (DO NOT run now):
-- ALTER TABLE orders DROP COLUMN IF EXISTS louvin_transaction_id;
-- ALTER TABLE orders DROP COLUMN IF EXISTS payment_qr_string;
-- ALTER TABLE orders DROP COLUMN IF EXISTS payment_va_number;
