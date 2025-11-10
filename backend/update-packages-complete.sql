-- Update all packages with proper location details and complete itineraries

-- First, let's get location IDs for reference
DO $$
DECLARE
  kerala_location_id UUID;
  rajasthan_location_id UUID;
  himachal_location_id UUID;
  goa_location_id UUID;
  delhi_location_id UUID;
  package_id UUID;
BEGIN

-- Get or create locations
SELECT id INTO kerala_location_id FROM locations WHERE area = 'Alleppey' AND state = 'Kerala' LIMIT 1;
SELECT id INTO rajasthan_location_id FROM locations WHERE area = 'Jaipur' AND state = 'Rajasthan' LIMIT 1;
SELECT id INTO himachal_location_id FROM locations WHERE area = 'Manali' AND state = 'Himachal Pradesh' LIMIT 1;
SELECT id INTO goa_location_id FROM locations WHERE area = 'North Goa' AND state = 'Goa' LIMIT 1;
SELECT id INTO delhi_location_id FROM locations WHERE area = 'New Delhi' AND state = 'Delhi' LIMIT 1;

-- Update Package 1: Kerala Backwaters
SELECT id INTO package_id FROM packages WHERE title LIKE '%Kerala Backwaters%' LIMIT 1;
IF package_id IS NOT NULL THEN
  UPDATE packages SET
    "locationId" = kerala_location_id,
    "customCountry" = 'India',
    "customState" = 'Kerala',
    "customArea" = 'Alleppey & Kumarakom'
  WHERE id = package_id;
  
  -- Delete existing itinerary
  DELETE FROM itinerary_days WHERE "packageId" = package_id;
  
  -- Add complete itinerary with transportation
  INSERT INTO itinerary_days (id, "packageId", day, title, description, activities) VALUES
  (gen_random_uuid(), package_id, 1, 'Arrival in Kochi', 
   'Welcome to God''s Own Country! Our representative will meet you at Cochin International Airport and transfer you to your hotel in Fort Kochi.',
   ARRAY['Airport pickup by AC car', 'Check-in at heritage hotel', 'Evening walk at Fort Kochi beach', 'Welcome dinner with traditional Kerala cuisine']),
  
  (gen_random_uuid(), package_id, 2, 'Kochi Sightseeing', 
   'Explore the historic port city of Kochi with its blend of Portuguese, Dutch, and British influences.',
   ARRAY['Private AC car for sightseeing', 'Visit Chinese Fishing Nets', 'St. Francis Church and Santa Cruz Basilica', 'Mattancherry Palace and Jewish Synagogue', 'Kathakali dance performance in evening']),
  
  (gen_random_uuid(), package_id, 3, 'Kochi to Alleppey - Houseboat Check-in', 
   'Drive to Alleppey (1.5 hours) and board your traditional Kerala houseboat for a magical backwater cruise.',
   ARRAY['AC car transfer to Alleppey (65 km)', 'Check-in to deluxe houseboat at 12 PM', 'Cruise through narrow canals and lagoons', 'Traditional Kerala lunch and dinner on board', 'Overnight stay in houseboat']),
  
  (gen_random_uuid(), package_id, 4, 'Backwater Cruise & Kumarakom', 
   'Continue your houseboat journey through the serene backwaters, witnessing village life and lush paddy fields.',
   ARRAY['Houseboat cruise to Kumarakom', 'Village visits and local interactions', 'Bird watching at Kumarakom Bird Sanctuary', 'Traditional toddy tapping demonstration', 'Fresh seafood meals on board']),
  
  (gen_random_uuid(), package_id, 5, 'Departure', 
   'Check out from houseboat and transfer to Cochin airport for your onward journey.',
   ARRAY['Houseboat check-out at 9 AM', 'AC car transfer to Cochin Airport (85 km)', 'Departure with sweet memories']);
END IF;

-- Update Package 2: Rajasthan Heritage
SELECT id INTO package_id FROM packages WHERE title LIKE '%Rajasthan%Heritage%' LIMIT 1;
IF package_id IS NOT NULL THEN
  UPDATE packages SET
    "locationId" = rajasthan_location_id,
    "customCountry" = 'India',
    "customState" = 'Rajasthan',
    "customArea" = 'Jaipur, Udaipur & Jodhpur'
  WHERE id = package_id;
  
  DELETE FROM itinerary_days WHERE "packageId" = package_id;
  
  INSERT INTO itinerary_days (id, "packageId", day, title, description, activities) VALUES
  (gen_random_uuid(), package_id, 1, 'Arrival in Jaipur - The Pink City', 
   'Welcome to Rajasthan! Arrive at Jaipur International Airport and transfer to your heritage hotel.',
   ARRAY['Airport pickup by AC car', 'Check-in at heritage hotel', 'Evening visit to Birla Temple', 'Welcome dinner at Chokhi Dhani village resort']),
  
  (gen_random_uuid(), package_id, 2, 'Jaipur City Tour', 
   'Explore the magnificent forts and palaces of Jaipur, showcasing Rajput grandeur.',
   ARRAY['Private AC car with driver', 'Amber Fort with elephant/jeep ride', 'Jal Mahal photo stop', 'City Palace and Museum', 'Hawa Mahal', 'Jantar Mantar Observatory', 'Shopping at Johari Bazaar']),
  
  (gen_random_uuid(), package_id, 3, 'Jaipur to Jodhpur', 
   'Drive to the Blue City of Jodhpur through the Thar Desert landscape.',
   ARRAY['AC car journey to Jodhpur (340 km, 6 hours)', 'En-route visit to Pushkar (optional)', 'Check-in at heritage hotel', 'Evening at Mehrangarh Fort for sunset views', 'Dinner at rooftop restaurant overlooking fort']),
  
  (gen_random_uuid(), package_id, 4, 'Jodhpur Sightseeing', 
   'Discover the majestic Mehrangarh Fort and the blue houses of old city.',
   ARRAY['Private AC car for sightseeing', 'Mehrangarh Fort and Museum', 'Jaswant Thada marble cenotaph', 'Umaid Bhawan Palace', 'Walk through blue city lanes', 'Flying fox zipline at fort (optional)', 'Traditional Rajasthani thali dinner']),
  
  (gen_random_uuid(), package_id, 5, 'Jodhpur to Udaipur', 
   'Journey to the romantic City of Lakes through Aravalli hills.',
   ARRAY['AC car journey to Udaipur (260 km, 5 hours)', 'En-route visit to Ranakpur Jain Temples', 'Check-in at lake-facing hotel', 'Evening boat ride on Lake Pichola', 'Dinner at Ambrai restaurant with lake view']),
  
  (gen_random_uuid(), package_id, 6, 'Udaipur City Tour', 
   'Explore the Venice of the East with its beautiful lakes and palaces.',
   ARRAY['Private AC car for sightseeing', 'City Palace complex and Museum', 'Jagdish Temple', 'Saheliyon ki Bari gardens', 'Bagore ki Haveli with cultural show', 'Sunset at Sajjangarh Palace (Monsoon Palace)', 'Farewell dinner cruise on Lake Pichola']),
  
  (gen_random_uuid(), package_id, 7, 'Departure from Udaipur', 
   'Transfer to Udaipur airport for your onward journey.',
   ARRAY['Hotel check-out', 'AC car transfer to Maharana Pratap Airport', 'Departure with royal memories']);
END IF;

-- Update Package 3: Himalayan Adventure
SELECT id INTO package_id FROM packages WHERE title LIKE '%Himalayan%' LIMIT 1;
IF package_id IS NOT NULL THEN
  UPDATE packages SET
    "locationId" = himachal_location_id,
    "customCountry" = 'India',
    "customState" = 'Himachal Pradesh',
    "customArea" = 'Manali & Shimla'
  WHERE id = package_id;
  
  DELETE FROM itinerary_days WHERE "packageId" = package_id;
  
  INSERT INTO itinerary_days (id, "packageId", day, title, description, activities) VALUES
  (gen_random_uuid(), package_id, 1, 'Arrival in Manali', 
   'Welcome to the Valley of Gods! Arrive at Bhuntar Airport and scenic drive to Manali.',
   ARRAY['Airport pickup by AC car', 'Scenic drive to Manali (50 km, 2 hours)', 'Check-in at hotel', 'Evening walk on Mall Road', 'Dinner at hotel']),
  
  (gen_random_uuid(), package_id, 2, 'Manali Local Sightseeing', 
   'Explore the beautiful town of Manali and its ancient temples.',
   ARRAY['Private AC car for sightseeing', 'Hadimba Devi Temple', 'Manu Temple', 'Vashisht Hot Springs', 'Tibetan Monastery', 'Van Vihar Park', 'Shopping at Mall Road']),
  
  (gen_random_uuid(), package_id, 3, 'Solang Valley Adventure', 
   'Full day excursion to Solang Valley for adventure activities.',
   ARRAY['AC car to Solang Valley (14 km)', 'Paragliding (optional)', 'Zorbing and skiing (seasonal)', 'Cable car ride', 'Horse riding', 'Return to Manali', 'Bonfire and BBQ dinner']),
  
  (gen_random_uuid(), package_id, 4, 'Manali to Shimla', 
   'Scenic drive through mountains to the Queen of Hills.',
   ARRAY['AC car journey to Shimla (250 km, 7-8 hours)', 'Photo stops at scenic viewpoints', 'Check-in at hotel', 'Evening walk on Mall Road and Ridge', 'Dinner at hotel']),
  
  (gen_random_uuid(), package_id, 5, 'Shimla Sightseeing & Kufri', 
   'Explore colonial architecture and visit nearby Kufri.',
   ARRAY['Private AC car for sightseeing', 'Kufri excursion with horse riding', 'Jakhu Temple (highest point)', 'Christ Church', 'Mall Road shopping', 'Toy train ride (optional)', 'Farewell dinner']),
  
  (gen_random_uuid(), package_id, 6, 'Departure from Shimla', 
   'Transfer to Chandigarh/Shimla for your onward journey.',
   ARRAY['Hotel check-out', 'AC car transfer to Chandigarh Airport (120 km)', 'Departure']);
END IF;

-- Update Package 4: Goa Beach
SELECT id INTO package_id FROM packages WHERE title LIKE '%Goa%' LIMIT 1;
IF package_id IS NOT NULL THEN
  UPDATE packages SET
    "locationId" = goa_location_id,
    "customCountry" = 'India',
    "customState" = 'Goa',
    "customArea" = 'North & South Goa'
  WHERE id = package_id;
  
  DELETE FROM itinerary_days WHERE "packageId" = package_id;
  
  INSERT INTO itinerary_days (id, "packageId", day, title, description, activities) VALUES
  (gen_random_uuid(), package_id, 1, 'Arrival in Goa', 
   'Welcome to the beach paradise! Arrive at Goa International Airport.',
   ARRAY['Airport pickup by AC car', 'Check-in at beach resort', 'Relax at beach', 'Welcome drink and dinner', 'Evening beach walk']),
  
  (gen_random_uuid(), package_id, 2, 'North Goa Tour', 
   'Explore the famous beaches and forts of North Goa.',
   ARRAY['Private AC car for sightseeing', 'Fort Aguada', 'Calangute Beach', 'Baga Beach with water sports', 'Anjuna Flea Market (Wednesday)', 'Chapora Fort', 'Sunset at Vagator Beach']),
  
  (gen_random_uuid(), package_id, 3, 'South Goa & Old Goa', 
   'Discover Portuguese heritage and pristine beaches.',
   ARRAY['AC car to South Goa', 'Basilica of Bom Jesus', 'Se Cathedral', 'Colva Beach', 'Palolem Beach', 'Cabo de Rama Fort', 'Spice plantation tour with lunch', 'Return to hotel']),
  
  (gen_random_uuid(), package_id, 4, 'Leisure Day & Departure', 
   'Free time for beach activities and shopping before departure.',
   ARRAY['Morning at leisure', 'Beach activities or spa', 'Shopping at local markets', 'Check-out and AC car transfer to airport', 'Departure']);
END IF;

-- Update Package 5: Golden Triangle
SELECT id INTO package_id FROM packages WHERE title LIKE '%Golden Triangle%' LIMIT 1;
IF package_id IS NOT NULL THEN
  UPDATE packages SET
    "locationId" = delhi_location_id,
    "customCountry" = 'India',
    "customState" = 'Delhi',
    "customArea" = 'Delhi, Agra & Jaipur'
  WHERE id = package_id;
  
  DELETE FROM itinerary_days WHERE "packageId" = package_id;
  
  INSERT INTO itinerary_days (id, "packageId", day, title, description, activities) VALUES
  (gen_random_uuid(), package_id, 1, 'Arrival in Delhi', 
   'Welcome to India''s capital! Arrive at Indira Gandhi International Airport.',
   ARRAY['Airport pickup by AC car', 'Check-in at hotel', 'Evening visit to India Gate', 'Dinner at Connaught Place']),
  
  (gen_random_uuid(), package_id, 2, 'Delhi Sightseeing', 
   'Full day exploring Old and New Delhi monuments.',
   ARRAY['Private AC car with driver', 'Red Fort', 'Jama Masjid', 'Chandni Chowk rickshaw ride', 'Raj Ghat', 'Qutub Minar', 'Humayun''s Tomb', 'Lotus Temple', 'Drive past President House and Parliament']),
  
  (gen_random_uuid(), package_id, 3, 'Delhi to Agra', 
   'Drive to Agra and visit the magnificent Taj Mahal.',
   ARRAY['AC car journey to Agra (230 km, 4 hours)', 'Check-in at hotel', 'Visit Taj Mahal at sunset', 'Agra Fort', 'Mehtab Bagh for Taj view', 'Dinner at hotel']),
  
  (gen_random_uuid(), package_id, 4, 'Agra to Jaipur via Fatehpur Sikri', 
   'Journey to Pink City with en-route sightseeing.',
   ARRAY['Early morning Taj Mahal visit at sunrise', 'AC car journey to Jaipur (240 km, 5 hours)', 'En-route visit to Fatehpur Sikri', 'Chand Baori stepwell at Abhaneri', 'Check-in at Jaipur hotel', 'Evening at leisure']),
  
  (gen_random_uuid(), package_id, 5, 'Jaipur Sightseeing & Departure', 
   'Explore Jaipur and transfer to airport.',
   ARRAY['Private AC car for sightseeing', 'Amber Fort with elephant ride', 'Jal Mahal photo stop', 'City Palace', 'Hawa Mahal', 'Jantar Mantar', 'Transfer to Jaipur Airport', 'Departure']);
END IF;

END $$;

-- Verify all packages now have locations and itineraries
SELECT 
  p.title,
  p."customCountry",
  p."customState",
  p."customArea",
  p.duration,
  p.price,
  COUNT(i.id) as itinerary_days
FROM packages p
LEFT JOIN itinerary_days i ON p.id = i."packageId"
GROUP BY p.id, p.title, p."customCountry", p."customState", p."customArea", p.duration, p.price
ORDER BY p.title;
