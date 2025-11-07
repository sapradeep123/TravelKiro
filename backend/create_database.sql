-- Run this script in PGAdmin to create the database
-- Right-click on "PostgreSQL 16" -> Query Tool -> Paste this and Execute

CREATE DATABASE travel_encyclopedia
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE travel_encyclopedia
    IS 'Travel Encyclopedia Application Database';
