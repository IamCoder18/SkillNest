-- Add token-related fields to bookings table
ALTER TABLE bookings
ADD COLUMN transaction_hash TEXT,
ADD COLUMN token_metadata_uri TEXT;

-- Add comments
COMMENT ON COLUMN bookings.transaction_hash IS 'Blockchain transaction hash for Proof of Skill token minting';
COMMENT ON COLUMN bookings.token_metadata_uri IS 'IPFS URI containing the token metadata';