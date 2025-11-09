-- Sample Travel Packages for Testing

-- First, get a user ID and location ID (adjust these based on your database)
-- You can find these by running: SELECT id FROM users LIMIT 1; and SELECT id FROM locations LIMIT 1;

-- Insert sample packages (replace USER_ID and LOCATION_ID with actual IDs from your database)

-- Package 1: Kerala Backwaters Tour
INSERT INTO packages (id, title, description, duration, price, images, "hostId", "hostRole", "approvalStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Kerala Backwaters Experience',
  'Explore the serene backwaters of Kerala with houseboat stays, traditional cuisine, and scenic beauty. Visit Alleppey, Kumarakom, and experience authentic Kerala culture.',
  5,
  25000,
  ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'],
  (SELECT id FROM users WHERE role = 'TOURIST_GUIDE' LIMIT 1),
  'TOURIST_GUIDE',
  'APPROVED',
  NOW(),
  NOW()
);

-- Package 2: Rajasthan Heritage Tour
INSERT INTO packages (id, title, description, duration, price, images, "hostId", "hostRole", "approvalStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Rajasthan Royal Heritage Tour',
  'Experience the grandeur of Rajasthan with visits to Jaipur, Udaipur, and Jodhpur. Explore magnificent forts, palaces, and immerse in royal culture.',
  7,
  45000,
  ARRAY['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800'],
  (SELECT id FROM users WHERE role = 'TOURIST_GUIDE' LIMIT 1),
  'TOURIST_GUIDE',
  'APPROVED',
  NOW(),
  NOW()
);

-- Package 3: Himalayan Adventure
INSERT INTO packages (id, title, description, duration, price, images, "hostId", "hostRole", "approvalStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Himalayan Adventure Package',
  'Trek through the majestic Himalayas, visit Manali and Shimla, experience snow-capped peaks, adventure sports, and mountain culture.',
  6,
  35000,
  ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
  (SELECT id FROM users WHERE role = 'GOVT_DEPARTMENT' LIMIT 1),
  'GOVT_DEPARTMENT',
  'APPROVED',
  NOW(),
  NOW()
);

-- Package 4: Goa Beach Holiday
INSERT INTO packages (id, title, description, duration, price, images, "hostId", "hostRole", "approvalStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Goa Beach Paradise',
  'Relax on pristine beaches, enjoy water sports, explore Portuguese heritage, and experience vibrant nightlife in Goa.',
  4,
  20000,
  ARRAY['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
  (SELECT id FROM users WHERE role = 'TOURIST_GUIDE' LIMIT 1),
  'TOURIST_GUIDE',
  'APPROVED',
  NOW(),
  NOW()
);

-- Package 5: Golden Triangle Tour
INSERT INTO packages (id, title, description, duration, price, images, "hostId", "hostRole", "approvalStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Golden Triangle - Delhi, Agra, Jaipur',
  'Discover India''s most iconic destinations: Delhi''s monuments, Agra''s Taj Mahal, and Jaipur''s pink city. Perfect introduction to India.',
  5,
  30000,
  ARRAY['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'],
  (SELECT id FROM users WHERE role = 'GOVT_DEPARTMENT' LIMIT 1),
  'GOVT_DEPARTMENT',
  'APPROVED',
  NOW(),
  NOW()
);

-- Add itinerary for Package 1 (Kerala)
INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  1,
  'Arrival in Kochi',
  'Welcome to Kerala! Transfer to hotel and evening city tour.',
  ARRAY['Airport pickup', 'Hotel check-in', 'Fort Kochi visit', 'Chinese fishing nets']
FROM packages WHERE title = 'Kerala Backwaters Experience';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  2,
  'Kochi to Alleppey',
  'Drive to Alleppey and board traditional houseboat.',
  ARRAY['Houseboat cruise', 'Backwater views', 'Traditional lunch', 'Village visits']
FROM packages WHERE title = 'Kerala Backwaters Experience';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  3,
  'Alleppey Backwaters',
  'Full day exploring the serene backwaters.',
  ARRAY['Houseboat stay', 'Bird watching', 'Local cuisine', 'Sunset views']
FROM packages WHERE title = 'Kerala Backwaters Experience';

-- Add itinerary for Package 2 (Rajasthan)
INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  1,
  'Arrival in Jaipur',
  'Welcome to the Pink City! City palace and local markets.',
  ARRAY['Airport pickup', 'City Palace', 'Hawa Mahal', 'Local bazaar']
FROM packages WHERE title = 'Rajasthan Royal Heritage Tour';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  2,
  'Jaipur Sightseeing',
  'Explore magnificent forts and palaces.',
  ARRAY['Amber Fort', 'Jal Mahal', 'Jantar Mantar', 'Traditional dinner']
FROM packages WHERE title = 'Rajasthan Royal Heritage Tour';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  3,
  'Jaipur to Udaipur',
  'Drive to the City of Lakes.',
  ARRAY['Scenic drive', 'Lake Pichola', 'City Palace Udaipur', 'Boat ride']
FROM packages WHERE title = 'Rajasthan Royal Heritage Tour';

-- Verify the data
SELECT 
  p.title,
  p.duration,
  p.price,
  p."approvalStatus",
  COUNT(i.id) as itinerary_days
FROM packages p
LEFT JOIN itinerary_days i ON p.id = i."packageId"
GROUP BY p.id, p.title, p.duration, p.price, p."approvalStatus"
ORDER BY p."createdAt" DESC;
