-- Seed Payment Methods Configuration for African and Global Regions

-- NIGERIA
INSERT INTO payment_methods_config (region, country_code, country_name, method_type, provider_name, provider_code, is_deposit_enabled, is_withdrawal_enabled, min_amount, max_amount, deposit_fee_percentage, deposit_flat_fee, withdrawal_fee_percentage, withdrawal_flat_fee, processing_time_minutes, currency, api_endpoint, api_key_required, config)
VALUES 
  ('West Africa', 'NG', 'Nigeria', 'bank', 'Access Bank', 'access_bank', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'NGN', 'https://api.accessbank.ng', true, '{"bankCode": "044"}'),
  ('West Africa', 'NG', 'Nigeria', 'bank', 'GTBank', 'gtbank', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'NGN', 'https://api.gtbank.ng', true, '{"bankCode": "058"}'),
  ('West Africa', 'NG', 'Nigeria', 'bank', 'First Bank', 'first_bank', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'NGN', 'https://api.firstbank.ng', true, '{"bankCode": "011"}'),
  ('West Africa', 'NG', 'Nigeria', 'bank', 'Zenith Bank', 'zenith_bank', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'NGN', 'https://api.zenithbank.ng', true, '{"bankCode": "057"}'),
  ('West Africa', 'NG', 'Nigeria', 'mobile', 'MTN Mobile Money', 'mtn_momo_ng', true, true, 100, 500000, 1.5, 0, 1.5, 0, 5, 'NGN', 'https://api.mtn.ng', true, '{"operatorCode": "MTN_NG"}'),
  ('West Africa', 'NG', 'Nigeria', 'mobile', 'Airtel Money', 'airtel_money_ng', true, true, 100, 500000, 1.5, 0, 1.5, 0, 5, 'NGN', 'https://api.airtel.ng', true, '{"operatorCode": "AIRTEL_NG"}'),
  ('West Africa', 'NG', 'Nigeria', 'ewallet', 'Paystack', 'paystack_ng', true, true, 100, 5000000, 1.5, 0, 1.5, 0, 2, 'NGN', 'https://api.paystack.co', true, '{"publicKey": ""}'),
  ('West Africa', 'NG', 'Nigeria', 'ewallet', 'Flutterwave', 'flutterwave_ng', true, true, 100, 5000000, 1.8, 0, 1.8, 0, 2, 'NGN', 'https://api.flutterwave.com', true, '{"apiKey": ""}'),
  ('West Africa', 'NG', 'Nigeria', 'ewallet', 'OPay', 'opay_ng', true, true, 100, 1000000, 1.0, 0, 1.0, 0, 1, 'NGN', 'https://api.opay.ng', true, '{"merchantId": ""}'),
  ('West Africa', 'NG', 'Nigeria', 'card', 'Credit/Debit Card', 'card_international', true, true, 100, 5000000, 2.9, 0, 0, 0, 5, 'NGN', 'https://api.payment-gateway.com', true, '{"gateway": "international"}'),

-- KENYA
  ('East Africa', 'KE', 'Kenya', 'bank', 'KCB Bank', 'kcb_bank', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'KES', 'https://api.kcbbank.co.ke', true, '{"bankCode": "001"}'),
  ('East Africa', 'KE', 'Kenya', 'bank', 'Equity Bank', 'equity_bank', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'KES', 'https://api.equitybank.co.ke', true, '{"bankCode": "005"}'),
  ('East Africa', 'KE', 'Kenya', 'mobile', 'M-Pesa', 'mpesa_ke', true, true, 50, 500000, 0.5, 0, 0.5, 0, 1, 'KES', 'https://api.safaricom.co.ke', true, '{"operatorCode": "MPESA"}'),
  ('East Africa', 'KE', 'Kenya', 'bank', 'Safaricom M-Pesa Bank', 'mpesa_bank_ke', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'KES', 'https://api.safaricom.co.ke', true, '{"bankCode": "MPESAB"}'),
  ('East Africa', 'KE', 'Kenya', 'ewallet', 'Pesapal', 'pesapal_ke', true, true, 100, 1000000, 2.0, 0, 2.0, 0, 5, 'KES', 'https://api.pesapal.com', true, '{"merchantId": ""}'),
  ('East Africa', 'KE', 'Kenya', 'ewallet', 'Flutterwave', 'flutterwave_ke', true, true, 100, 5000000, 1.8, 0, 1.8, 0, 2, 'KES', 'https://api.flutterwave.com', true, '{"apiKey": ""}'),

-- GHANA
  ('West Africa', 'GH', 'Ghana', 'bank', 'Ecobank Ghana', 'ecobank_gh', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'GHS', 'https://api.ecobank.gh', true, '{"bankCode": "130"}'),
  ('West Africa', 'GH', 'Ghana', 'mobile', 'MTN Mobile Money', 'mtn_momo_gh', true, true, 100, 500000, 1.0, 0, 1.0, 0, 5, 'GHS', 'https://api.mtn.gh', true, '{"operatorCode": "MTN_GH"}'),
  ('West Africa', 'GH', 'Ghana', 'ewallet', 'Paystack', 'paystack_gh', true, true, 100, 5000000, 1.5, 0, 1.5, 0, 2, 'GHS', 'https://api.paystack.co', true, '{"publicKey": ""}'),

-- SOUTH AFRICA
  ('Southern Africa', 'ZA', 'South Africa', 'bank', 'FNB', 'fnb_za', true, true, 100, 2000000, 0, 0, 0, 50, 1440, 'ZAR', 'https://api.fnb.co.za', true, '{"bankCode": "210558"}'),
  ('Southern Africa', 'ZA', 'South Africa', 'bank', 'Standard Bank', 'standard_bank_za', true, true, 100, 2000000, 0, 0, 0, 50, 1440, 'ZAR', 'https://api.standardbank.co.za', true, '{"bankCode": "051002"}'),
  ('Southern Africa', 'ZA', 'South Africa', 'ewallet', 'Luno', 'luno_za', true, true, 100, 500000, 1.0, 0, 1.0, 0, 10, 'ZAR', 'https://api.luno.com', true, '{"apiKey": ""}'),

-- UGANDA
  ('East Africa', 'UG', 'Uganda', 'bank', 'Stanbic Bank Uganda', 'stanbic_ug', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'UGX', 'https://api.stanbicbank.co.ug', true, '{"bankCode": "001"}'),
  ('East Africa', 'UG', 'Uganda', 'mobile', 'MTN Mobile Money', 'mtn_momo_ug', true, true, 100, 500000, 2.0, 0, 2.0, 0, 5, 'UGX', 'https://api.mtn.ug', true, '{"operatorCode": "MTN_UG"}'),
  ('East Africa', 'UG', 'Uganda', 'mobile', 'Airtel Money', 'airtel_money_ug', true, true, 100, 500000, 2.0, 0, 2.0, 0, 5, 'UGX', 'https://api.airtel.ug', true, '{"operatorCode": "AIRTEL_UG"}'),

-- TANZANIA
  ('East Africa', 'TZ', 'Tanzania', 'bank', 'NMB Bank', 'nmb_tz', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'TZS', 'https://api.nmbbank.co.tz', true, '{"bankCode": "005"}'),
  ('East Africa', 'TZ', 'Tanzania', 'mobile', 'Tigo Pesa', 'tigo_pesa_tz', true, true, 100, 500000, 1.0, 0, 1.0, 0, 5, 'TZS', 'https://api.tigo.tz', true, '{"operatorCode": "TIGO_TZ"}'),

-- RWANDA
  ('East Africa', 'RW', 'Rwanda', 'bank', 'BPR Bank', 'bpr_rw', true, true, 100, 1000000, 0, 0, 0, 50, 1440, 'RWF', 'https://api.bprbank.rw', true, '{"bankCode": "010"}'),
  ('East Africa', 'RW', 'Rwanda', 'mobile', 'MTN Mobile Money', 'mtn_momo_rw', true, true, 100, 500000, 1.5, 0, 1.5, 0, 5, 'RWF', 'https://api.mtn.rw', true, '{"operatorCode": "MTN_RW"}'),

-- INDIA
  ('South Asia', 'IN', 'India', 'bank', 'ICICI Bank', 'icici_bank_in', true, true, 100, 5000000, 0, 0, 0, 100, 1440, 'INR', 'https://api.icicibank.com', true, '{"bankCode": "ICIC"}'),
  ('South Asia', 'IN', 'India', 'bank', 'HDFC Bank', 'hdfc_bank_in', true, true, 100, 5000000, 0, 0, 0, 100, 1440, 'INR', 'https://api.hdfcbank.com', true, '{"bankCode": "HDFC"}'),
  ('South Asia', 'IN', 'India', 'ewallet', 'PayTM', 'paytm_in', true, true, 100, 1000000, 2.0, 0, 2.0, 0, 2, 'INR', 'https://api.paytm.com', true, '{"merchantId": ""}'),
  ('South Asia', 'IN', 'India', 'ewallet', 'Google Pay', 'gpay_in', true, true, 100, 1000000, 0, 0, 0, 0, 1, 'INR', 'https://api.google.com/pay', true, '{}'),

-- PHILIPPINES
  ('Southeast Asia', 'PH', 'Philippines', 'bank', 'BDO Unibank', 'bdo_ph', true, true, 100, 5000000, 0, 0, 0, 50, 1440, 'PHP', 'https://api.bdo.com.ph', true, '{"bankCode": "0011"}'),
  ('Southeast Asia', 'PH', 'Philippines', 'mobile', 'GCash', 'gcash_ph', true, true, 50, 500000, 1.0, 0, 1.0, 0, 2, 'PHP', 'https://api.gcash.com', true, '{"operatorCode": "GCASH"}'),
  ('Southeast Asia', 'PH', 'Philippines', 'ewallet', 'PayMaya', 'paymaya_ph', true, true, 100, 1000000, 2.0, 0, 2.0, 0, 5, 'PHP', 'https://api.paymaya.com', true, '{"merchantId": ""}'),

-- MEXICO
  ('Latin America', 'MX', 'Mexico', 'bank', 'BBVA Mexico', 'bbva_mx', true, true, 100, 5000000, 0, 0, 0, 100, 1440, 'MXN', 'https://api.bbva.mx', true, '{"bankCode": "012"}'),
  ('Latin America', 'MX', 'Mexico', 'ewallet', 'OXXO', 'oxxo_mx', true, true, 100, 100000, 2.0, 0, 2.0, 0, 30, 'MXN', 'https://api.oxxo.com', true, '{}'),

-- BRAZIL
  ('Latin America', 'BR', 'Brazil', 'bank', 'Itaú', 'itau_br', true, true, 100, 5000000, 0, 0, 0, 50, 1440, 'BRL', 'https://api.itau.com.br', true, '{"bankCode": "341"}'),
  ('Latin America', 'BR', 'Brazil', 'bank', 'Bradesco', 'bradesco_br', true, true, 100, 5000000, 0, 0, 0, 50, 1440, 'BRL', 'https://api.bradesco.com.br', true, '{"bankCode": "237"}'),

-- UK/US/Global
  ('Global', 'GB', 'United Kingdom', 'bank', 'Barclays', 'barclays_uk', true, true, 100, 5000000, 0, 0, 0, 50, 1440, 'GBP', 'https://api.barclays.co.uk', true, '{}'),
  ('Global', 'US', 'United States', 'bank', 'Chase Bank', 'chase_us', true, true, 100, 5000000, 0, 0, 0, 100, 1440, 'USD', 'https://api.chase.com', true, '{}'),
  ('Global', 'US', 'United States', 'card', 'Stripe', 'stripe_us', true, true, 100, 5000000, 2.9, 0.30, 0, 0, 5, 'USD', 'https://api.stripe.com', true, '{"apiKey": ""}'),
  ('Global', 'XX', 'International', 'card', 'Visa/Mastercard', 'international_card', true, true, 100, 5000000, 2.9, 0, 0, 0, 5, 'USD', 'https://api.payment-gateway.com', true, '{}'),
  ('Global', 'XX', 'International', 'crypto', 'Bitcoin', 'btc', true, true, 0.001, 100, 0, 0, 0, 0, 30, 'BTC', 'https://blockchain.info', false, '{"network": "mainnet"}'),
  ('Global', 'XX', 'International', 'crypto', 'Ethereum', 'eth', true, true, 0.01, 1000, 0, 0, 0, 0, 30, 'ETH', 'https://etherscan.io', false, '{"network": "mainnet"}');
