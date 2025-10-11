-- Drop columns from bookings that are now in workshops table
ALTER TABLE public.bookings 
  DROP COLUMN IF EXISTS skill,
  DROP COLUMN IF EXISTS session_time;

-- Ensure workshop_id is NOT NULL since bookings must reference a workshop
-- First, delete any orphaned bookings without a workshop_id
DELETE FROM public.bookings WHERE workshop_id IS NULL;

-- Now make workshop_id NOT NULL
ALTER TABLE public.bookings 
  ALTER COLUMN workshop_id SET NOT NULL;
