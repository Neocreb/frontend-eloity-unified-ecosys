-- Create function for atomic wallet balance updates to prevent race conditions
CREATE OR REPLACE FUNCTION public.update_wallet_balance_atomic(
    p_user_id UUID,
    p_amount NUMERIC,
    p_currency TEXT,
    p_operation TEXT DEFAULT 'check_and_lock'
)
RETURNS TABLE(
    has_sufficient_balance BOOLEAN,
    wallet RECORD
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    wallet_row RECORD;
    current_balance NUMERIC;
    new_balance NUMERIC;
BEGIN
    -- Lock the wallet row for update to prevent race conditions
    SELECT * INTO wallet_row
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        -- Return false if wallet not found
        RETURN QUERY SELECT FALSE, NULL::RECORD;
        RETURN;
    END IF;
    
    -- Get current balance based on currency
    CASE UPPER(p_currency)
        WHEN 'USDT' THEN
            current_balance := COALESCE(wallet_row.usdt_balance, 0);
        WHEN 'ETH' THEN
            current_balance := COALESCE(wallet_row.eth_balance, 0);
        WHEN 'BTC' THEN
            current_balance := COALESCE(wallet_row.btc_balance, 0);
        ELSE
            current_balance := COALESCE(wallet_row.usdt_balance, 0);
    END CASE;
    
    -- Check if operation is just to check balance and lock
    IF p_operation = 'check_and_lock' THEN
        -- Check if sufficient balance
        IF current_balance >= p_amount THEN
            RETURN QUERY SELECT TRUE, wallet_row;
        ELSE
            RETURN QUERY SELECT FALSE, wallet_row;
        END IF;
        RETURN;
    END IF;
    
    -- For debit operations, check if sufficient balance
    IF p_operation = 'debit' THEN
        IF current_balance < p_amount THEN
            RAISE EXCEPTION 'Insufficient balance for debit operation';
        END IF;
        
        -- Calculate new balance
        new_balance := current_balance - p_amount;
        
        -- Update the wallet balance
        CASE UPPER(p_currency)
            WHEN 'USDT' THEN
                UPDATE public.wallets 
                SET usdt_balance = new_balance, updated_at = NOW()
                WHERE user_id = p_user_id;
            WHEN 'ETH' THEN
                UPDATE public.wallets 
                SET eth_balance = new_balance, updated_at = NOW()
                WHERE user_id = p_user_id;
            WHEN 'BTC' THEN
                UPDATE public.wallets 
                SET btc_balance = new_balance, updated_at = NOW()
                WHERE user_id = p_user_id;
            ELSE
                UPDATE public.wallets 
                SET usdt_balance = new_balance, updated_at = NOW()
                WHERE user_id = p_user_id;
        END CASE;
        
        -- Return success
        RETURN QUERY SELECT TRUE, wallet_row;
    END IF;
    
    -- For credit operations
    IF p_operation = 'credit' THEN
        -- Calculate new balance
        new_balance := current_balance + p_amount;
        
        -- Update the wallet balance
        CASE UPPER(p_currency)
            WHEN 'USDT' THEN
                UPDATE public.wallets 
                SET usdt_balance = new_balance, updated_at = NOW()
                WHERE user_id = p_user_id;
            WHEN 'ETH' THEN
                UPDATE public.wallets 
                SET eth_balance = new_balance, updated_at = NOW()
                WHERE user_id = p_user_id;
            WHEN 'BTC' THEN
                UPDATE public.wallets 
                SET btc_balance = new_balance, updated_at = NOW()
                WHERE user_id = p_user_id;
            ELSE
                UPDATE public.wallets 
                SET usdt_balance = new_balance, updated_at = NOW()
                WHERE user_id = p_user_id;
        END CASE;
        
        -- Return success
        RETURN QUERY SELECT TRUE, wallet_row;
    END IF;
    
    -- Default return
    RETURN QUERY SELECT FALSE, NULL::RECORD;
END;
$$;