-- Function to automatically delete workshops that have passed with no bookings
CREATE OR REPLACE FUNCTION cleanup_unbooked_past_workshops()
RETURNS void AS $$
BEGIN
  DELETE FROM workshops
  WHERE session_date < NOW()
  AND status = 'active'
  AND id NOT IN (
    SELECT DISTINCT workshop_id 
    FROM bookings 
    WHERE workshop_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a trigger to run this cleanup periodically
-- Note: This would require pg_cron extension or manual execution
-- For now, the cleanup happens when the workshops page loads
