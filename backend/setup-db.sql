-- Create dedicated user and database for Travel app
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'travelapp') THEN
        CREATE USER travelapp WITH PASSWORD 'TravelKiro2024!';
    END IF;
END
$$;

-- Create database if not exists
SELECT 'CREATE DATABASE travelkiro_db OWNER travelapp'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'travelkiro_db')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE travelkiro_db TO travelapp;
