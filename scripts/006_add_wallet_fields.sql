-- Add wallet address and opt-out fields to profiles table
alter table public.profiles
add column if not exists wallet_address text,
add column if not exists wallet_opted_out boolean default false;

-- Add check constraint for wallet address format (if provided) - only if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.check_constraints where constraint_name = 'wallet_address_format' and constraint_schema = 'public') then
    alter table public.profiles
    add constraint wallet_address_format check (
      wallet_address is null or
      (length(wallet_address) = 42 and wallet_address ~ '^0x[0-9a-fA-F]{40}$')
    );
  end if;
end $$;

-- Update RLS policies if needed (wallet fields are part of profile, so existing policies should cover)