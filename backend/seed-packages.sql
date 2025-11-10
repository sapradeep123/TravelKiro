-- Sample Travel Packages for Testing

-- First, get a user ID and location ID (adjust these based on your database)
-- You can find these by running: SELECT id FROM users LIMIT 1; and SELECT id FROM locations LIMIT 1;

-- Insert sample packages (replace USER_ID and LOCATION_ID with actual IDs from your database)

-- Package 1: Kerala Backwaters Tour
INSERT INTO packages (id, title, description, duration, "customCountry", "customState", "customArea", price, images, "hostId", "hostRole", "approvalStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Kerala Backwaters Experience',
  'Explore the serene backwaters of Kerala with houseboat stays, traditional cuisine, and scenic beauty. Visit Alleppey, Kumarakom, and experience authentic Kerala culture.',
  5,
  'India',
  'Kerala',
  'Alleppey & Kumarakom',
  25000,
  ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'],
  (SELECT id FROM users WHERE role = 'TOURIST_GUIDE' LIMIT 1),
  'TOURIST_GUIDE',
  'APPROVED',
  NOW(),
  NOW()
);

-- Package 2: Rajasthan Heritage Tour
INSERT INTO packages (id, title, description, duration, "customCountry", "customState", "customArea", price, images, "hostId", "hostRole", "approvalStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Rajasthan Royal Heritage Tour',
  'Experience the grandeur of Rajasthan with visits to Jaipur, Udaipur, and Jodhpur. Explore magnificent forts, palaces, and immerse in royal culture.',
  7,
  'India',
  'Rajasthan',
  'Jaipur, Udaipur & Jodhpur',
  45000,
  ARRAY['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800'],
  (SELECT id FROM users WHERE role = 'TOURIST_GUIDE' LIMIT 1),
  'TOURIST_GUIDE',
  'APPROVED',
  NOW(),
  NOW()
);

-- Package 3: Himalayan Adventure
INSERT INTO packages (id, title, description, duration, "customCountry", "customState", "customArea", price, images, "hostId", "hostRole", "approvalStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Himalayan Adventure Package',
  'Trek through the majestic Himalayas, visit Manali and Shimla, experience snow-capped peaks, adventure sports, and mountain culture.',
  6,
  'India',
  'Himachal Pradesh',
  'Manali & Shimla',
  35000,
  ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
  (SELECT id FROM users WHERE role = 'GOVT_DEPARTMENT' LIMIT 1),
  'GOVT_DEPARTMENT',
  'APPROVED',
  NOW(),
  NOW()
);

-- Package 4: Goa Beach Holiday
INSERT INTO packages (id, title, description, duration, "customCountry", "customState", "customArea", price, images, "hostId", "hostRole", "approvalStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Goa Beach Paradise',
  'Relax on pristine beaches, enjoy water sports, explore Portuguese heritage, and experience vibrant nightlife in Goa.',
  4,
  'India',
  'Goa',
  'North & South Goa',
  20000,
  ARRAY['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
  (SELECT id FROM users WHERE role = 'TOURIST_GUIDE' LIMIT 1),
  'TOURIST_GUIDE',
  'APPROVED',
  NOW(),
  NOW()
);

-- Package 5: Golden Triangle Tour
INSERT INTO packages (id, title, description, duration, "customCountry", "customState", "customArea", price, images, "hostId", "hostRole", "approvalStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Golden Triangle - Delhi, Agra, Jaipur',
  'Discover India''s most iconic destinations: Delhi''s monuments, Agra''s Taj Mahal, and Jaipur''s pink city. Perfect introduction to India.',
  5,
  'India',
  'Delhi, Uttar Pradesh & Rajasthan',
  'Delhi, Agra & Jaipur',
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
  ARRAY['Houseboat stay', 'Bird watching', 'Local cuisine', 'Sunset views', 'Village visits']
FROM packages WHERE title = 'Kerala Backwaters Experience';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  4,
  'Kumarakom Bird Sanctuary',
  'Visit the famous bird sanctuary and enjoy nature.',
  ARRAY['Check out from houseboat', 'Kumarakom Bird Sanctuary visit', 'Ayurvedic spa session', 'Traditional Kerala lunch', 'Leisure time at resort']
FROM packages WHERE title = 'Kerala Backwaters Experience';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  5,
  'Departure from Kochi',
  'Return to Kochi for departure.',
  ARRAY['Breakfast at resort', 'Drive back to Kochi', 'Last minute shopping at Lulu Mall', 'Transfer to airport', 'Departure']
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
  'Jaipur to Jodhpur',
  'Drive to the Blue City and explore Mehrangarh Fort.',
  ARRAY['Scenic drive to Jodhpur (5-6 hours)', 'Lunch en route', 'Mehrangarh Fort visit', 'Jaswant Thada memorial', 'Clock Tower market walk']
FROM packages WHERE title = 'Rajasthan Royal Heritage Tour';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  4,
  'Jodhpur to Udaipur',
  'Journey to the City of Lakes with Ranakpur stop.',
  ARRAY['Drive to Udaipur', 'Stop at Ranakpur Jain Temples', 'Lunch at Ranakpur', 'Arrive Udaipur evening', 'Sunset at Lake Pichola']
FROM packages WHERE title = 'Rajasthan Royal Heritage Tour';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  5,
  'Udaipur City Tour',
  'Explore the romantic city of lakes and palaces.',
  ARRAY['City Palace complex', 'Jagdish Temple', 'Saheliyon ki Bari gardens', 'Boat ride on Lake Pichola', 'Visit Jag Mandir island']
FROM packages WHERE title = 'Rajasthan Royal Heritage Tour';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  6,
  'Udaipur Leisure Day',
  'Optional activities and shopping in Udaipur.',
  ARRAY['Optional: Monsoon Palace visit', 'Shopping at local markets', 'Miniature painting workshop', 'Rooftop dinner with lake view', 'Cultural show']
FROM packages WHERE title = 'Rajasthan Royal Heritage Tour';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  7,
  'Departure from Udaipur',
  'Final morning in Udaipur and departure.',
  ARRAY['Breakfast at hotel', 'Last minute shopping', 'Transfer to airport', 'Departure with memories']
FROM packages WHERE title = 'Rajasthan Royal Heritage Tour';

-- Add itinerary for Package 3 (Himalayan Adventure) - 6 days
INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  1,
  'Arrival in Manali',
  'Welcome to the mountains! Arrive and acclimatize.',
  ARRAY['Airport/Bus station pickup', 'Hotel check-in', 'Rest and acclimatization', 'Evening walk at Mall Road', 'Welcome dinner']
FROM packages WHERE title = 'Himalayan Adventure Package';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  2,
  'Manali Local Sightseeing',
  'Explore the beauty of Manali and surroundings.',
  ARRAY['Hadimba Temple visit', 'Manu Temple', 'Vashisht hot springs', 'Old Manali cafes', 'Tibetan Monastery']
FROM packages WHERE title = 'Himalayan Adventure Package';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  3,
  'Solang Valley Adventure',
  'Day trip to Solang Valley for adventure activities.',
  ARRAY['Drive to Solang Valley', 'Paragliding (optional)', 'Zorbing and skiing (seasonal)', 'Cable car ride', 'Return to Manali']
FROM packages WHERE title = 'Himalayan Adventure Package';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  4,
  'Manali to Shimla',
  'Scenic drive through the mountains to Shimla.',
  ARRAY['Checkout and drive to Shimla', 'Stop at Kullu Valley', 'Lunch at Mandi', 'Arrive Shimla evening', 'Mall Road walk']
FROM packages WHERE title = 'Himalayan Adventure Package';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  5,
  'Shimla Sightseeing',
  'Explore the colonial charm of Shimla.',
  ARRAY['Jakhu Temple (highest point)', 'The Ridge and Mall Road', 'Christ Church', 'Kufri excursion', 'Shopping at Lakkar Bazaar']
FROM packages WHERE title = 'Himalayan Adventure Package';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  6,
  'Departure from Shimla',
  'Final morning in Shimla and departure.',
  ARRAY['Breakfast at hotel', 'Last minute shopping', 'Transfer to airport/railway station', 'Departure']
FROM packages WHERE title = 'Himalayan Adventure Package';

-- Add itinerary for Package 4 (Goa Beach Paradise) - 4 days
INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  1,
  'Arrival in Goa',
  'Welcome to the beach paradise! Relax and unwind.',
  ARRAY['Airport pickup', 'Hotel check-in at beach resort', 'Relax at beach', 'Evening at Calangute Beach', 'Welcome dinner']
FROM packages WHERE title = 'Goa Beach Paradise';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  2,
  'North Goa Exploration',
  'Discover the vibrant beaches and forts of North Goa.',
  ARRAY['Fort Aguada visit', 'Anjuna Beach', 'Vagator Beach', 'Chapora Fort', 'Saturday Night Market (if Saturday)', 'Beach shacks dinner']
FROM packages WHERE title = 'Goa Beach Paradise';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  3,
  'South Goa & Water Sports',
  'Experience pristine beaches and adventure activities.',
  ARRAY['Palolem Beach visit', 'Water sports (jet ski, parasailing, banana boat)', 'Cabo de Rama Fort', 'Colva Beach', 'Sunset cruise']
FROM packages WHERE title = 'Goa Beach Paradise';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  4,
  'Old Goa & Departure',
  'Explore Portuguese heritage before departure.',
  ARRAY['Basilica of Bom Jesus', 'Se Cathedral', 'Church of St. Francis of Assisi', 'Spice plantation tour', 'Last minute shopping', 'Transfer to airport']
FROM packages WHERE title = 'Goa Beach Paradise';

-- Add itinerary for Package 5 (Golden Triangle) - 5 days
INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  1,
  'Arrival in Delhi',
  'Welcome to India''s capital! Explore Old and New Delhi.',
  ARRAY['Airport pickup', 'Hotel check-in', 'India Gate', 'Rashtrapati Bhavan drive-by', 'Qutub Minar', 'Evening at Connaught Place']
FROM packages WHERE title = 'Golden Triangle - Delhi, Agra, Jaipur';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  2,
  'Delhi Sightseeing & Drive to Agra',
  'Explore Delhi monuments and travel to Agra.',
  ARRAY['Red Fort', 'Jama Masjid', 'Chandni Chowk rickshaw ride', 'Raj Ghat', 'Drive to Agra (3-4 hours)', 'Evening at leisure']
FROM packages WHERE title = 'Golden Triangle - Delhi, Agra, Jaipur';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  3,
  'Agra - Taj Mahal & Drive to Jaipur',
  'Visit the iconic Taj Mahal and travel to Jaipur.',
  ARRAY['Sunrise at Taj Mahal', 'Agra Fort', 'Itmad-ud-Daulah (Baby Taj)', 'Drive to Jaipur via Fatehpur Sikri', 'Evening arrival in Jaipur']
FROM packages WHERE title = 'Golden Triangle - Delhi, Agra, Jaipur';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  4,
  'Jaipur - The Pink City',
  'Explore the royal heritage of Jaipur.',
  ARRAY['Amber Fort with elephant ride', 'Jal Mahal photo stop', 'City Palace', 'Jantar Mantar', 'Hawa Mahal', 'Evening at Chokhi Dhani village resort']
FROM packages WHERE title = 'Golden Triangle - Delhi, Agra, Jaipur';

INSERT INTO itinerary_days (id, "packageId", day, title, description, activities)
SELECT 
  gen_random_uuid(),
  id,
  5,
  'Jaipur Shopping & Departure',
  'Last minute shopping and departure.',
  ARRAY['Breakfast at hotel', 'Johari Bazaar shopping', 'Bapu Bazaar for textiles', 'Lunch at local restaurant', 'Transfer to airport', 'Departure']
FROM packages WHERE title = 'Golden Triangle - Delhi, Agra, Jaipur';

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
