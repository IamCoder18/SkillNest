-- Add completed_at timestamp to bookings table
ALTER TABLE bookings
ADD COLUMN completed_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN bookings.completed_at IS 'Timestamp when the booking was marked as completed by the host';
