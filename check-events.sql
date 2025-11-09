-- Check if events exist
SELECT COUNT(*) as event_count FROM "Event";

-- Show all events
SELECT id, title, "eventType", "startDate", "endDate", "isActive", "approvalStatus" 
FROM "Event" 
ORDER BY "startDate";
