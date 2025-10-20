-- Add last_dashboard_refresh_at timestamp to profiles table
ALTER TABLE profiles
ADD COLUMN last_dashboard_refresh_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN profiles.last_dashboard_refresh_at IS 'Timestamp of the last time the user refreshed their learner dashboard, stored in UTC';