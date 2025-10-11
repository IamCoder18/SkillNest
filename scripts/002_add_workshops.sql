-- Create workshops table where hosts define their sessions
CREATE TABLE IF NOT EXISTS public.workshops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES public.host_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  tools_provided TEXT[] NOT NULL DEFAULT '{}',
  session_date TIMESTAMPTZ NOT NULL,
  duration_hours DECIMAL NOT NULL CHECK (duration_hours > 0),
  price DECIMAL NOT NULL CHECK (price >= 0),
  max_participants INTEGER DEFAULT 1 CHECK (max_participants > 0),
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update bookings table to reference workshops
ALTER TABLE public.bookings 
  DROP COLUMN IF EXISTS session_date,
  DROP COLUMN IF EXISTS duration_hours,
  DROP COLUMN IF EXISTS hourly_rate,
  ADD COLUMN IF NOT EXISTS workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE;

-- Create index for faster workshop queries
CREATE INDEX IF NOT EXISTS idx_workshops_host_id ON public.workshops(host_id);
CREATE INDEX IF NOT EXISTS idx_workshops_session_date ON public.workshops(session_date);
CREATE INDEX IF NOT EXISTS idx_workshops_status ON public.workshops(status);
CREATE INDEX IF NOT EXISTS idx_bookings_workshop_id ON public.bookings(workshop_id);

-- Enable RLS on workshops
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workshops
-- Anyone can view active workshops
CREATE POLICY "Anyone can view active workshops"
  ON public.workshops FOR SELECT
  USING (status = 'active' OR auth.uid() IN (
    SELECT user_id FROM public.host_profiles WHERE id = host_id
  ));

-- Hosts can insert their own workshops
CREATE POLICY "Hosts can create workshops"
  ON public.workshops FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.host_profiles WHERE id = host_id
  ));

-- Hosts can update their own workshops
CREATE POLICY "Hosts can update their workshops"
  ON public.workshops FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.host_profiles WHERE id = host_id
  ));

-- Hosts can delete their own workshops
CREATE POLICY "Hosts can delete their workshops"
  ON public.workshops FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM public.host_profiles WHERE id = host_id
  ));

-- Update bookings RLS policies to work with workshops
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

-- New booking policies
CREATE POLICY "Users can view their bookings or workshops they host"
  ON public.bookings FOR SELECT
  USING (
    learner_id = auth.uid() OR 
    host_id IN (SELECT id FROM public.host_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create bookings for workshops"
  ON public.bookings FOR INSERT
  WITH CHECK (learner_id = auth.uid());

CREATE POLICY "Learners and hosts can update bookings"
  ON public.bookings FOR UPDATE
  USING (
    learner_id = auth.uid() OR 
    host_id IN (SELECT id FROM public.host_profiles WHERE user_id = auth.uid())
  );
