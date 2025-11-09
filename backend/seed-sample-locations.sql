-- Sample Locations Data for Testing
-- This script inserts diverse locations from different sources (Admin, Tourism Dept, Travel Agents)

-- First, get user IDs (you'll need to replace these with actual IDs from your database)
-- Run: SELECT id, email, role FROM "User" LIMIT 10;
-- Then replace the user IDs below with actual ones

-- Sample locations with different approval statuses and sources

-- 1. Admin-uploaded location (Auto-approved)
INSERT INTO "Location" (
  id, country, state, area, description, images, 
  latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance", "nearestBusStation", "busStationDistance",
  attractions, "kidsAttractions", "approvalStatus", "createdBy", "createdByRole",
  "approvedBy", "approvedAt", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Kerala',
  'Munnar',
  'Munnar is a town and hill station in the Idukki district of Kerala. It is situated at around 1,600 metres above sea level, in the Western Ghats mountain range. Munnar is known for its tea estates, exotic lush greenery and craggy peaks.',
  ARRAY[
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'
  ],
  10.0889,
  77.0595,
  'Munnar is well connected by road. The nearest airport is Cochin International Airport (110 km). Regular buses and taxis are available from major cities.',
  'Cochin International Airport',
  '110 km',
  'Aluva Railway Station',
  '108 km',
  'Munnar Bus Stand',
  'In town',
  ARRAY['Tea Gardens', 'Eravikulam National Park', 'Mattupetty Dam', 'Echo Point', 'Top Station'],
  ARRAY['Echo Point', 'Kundala Lake', 'Rose Garden', 'Elephant Safari'],
  'APPROVED',
  (SELECT id FROM "User" WHERE role = 'SITE_ADMIN' LIMIT 1),
  'SITE_ADMIN',
  (SELECT id FROM "User" WHERE role = 'SITE_ADMIN' LIMIT 1),
  NOW(),
  NOW(),
  NOW()
);

-- 2. Tourism Department location (Auto-approved)
INSERT INTO "Location" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance", attractions, "kidsAttractions",
  "approvalStatus", "createdBy", "createdByRole", "approvedBy", "approvedAt",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Rajasthan',
  'Jaipur',
  'Jaipur, the Pink City, is the capital of Rajasthan. Known for its rich history, magnificent forts, and vibrant culture. The city is famous for its pink-colored buildings and royal heritage.',
  ARRAY[
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800'
  ],
  26.9124,
  75.7873,
  'Jaipur is well connected by air, rail, and road. Jaipur International Airport has flights from major Indian cities. The city has excellent rail connectivity.',
  'Jaipur International Airport',
  '12 km',
  'Jaipur Junction',
  'In city',
  ARRAY['Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar', 'Nahargarh Fort', 'Jal Mahal'],
  ARRAY['Chokhi Dhani', 'Jaipur Zoo', 'Birla Planetarium', 'Fun Kingdom'],
  'APPROVED',
  (SELECT id FROM "User" WHERE role = 'GOVT_DEPARTMENT' LIMIT 1),
  'GOVT_DEPARTMENT',
  (SELECT id FROM "User" WHERE role = 'GOVT_DEPARTMENT' LIMIT 1),
  NOW(),
  NOW(),
  NOW()
);

-- 3. Travel Agent location (Pending approval)
INSERT INTO "Location" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
  attractions, "kidsAttractions", "approvalStatus", "createdBy", "createdByRole",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Goa',
  'North Goa',
  'North Goa is famous for its beautiful beaches, vibrant nightlife, and Portuguese heritage. Popular beaches include Baga, Calangute, and Anjuna. Perfect destination for beach lovers and party enthusiasts.',
  ARRAY[
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
  ],
  15.5057,
  73.9200,
  'Goa International Airport (Dabolim) is 40 km away. Well connected by trains and buses from major cities. Local transport includes taxis, bikes, and buses.',
  'Goa International Airport',
  '40 km',
  ARRAY['Baga Beach', 'Calangute Beach', 'Fort Aguada', 'Chapora Fort', 'Saturday Night Market'],
  ARRAY['Splashdown Waterpark', 'Butterfly Conservatory', 'Dolphin Watching', 'Beach Activities'],
  'PENDING',
  (SELECT id FROM "User" WHERE role = 'TOURIST_GUIDE' LIMIT 1),
  'TOURIST_GUIDE',
  NOW(),
  NOW()
);

-- 4. Admin location - Hill Station
INSERT INTO "Location" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance", attractions, "kidsAttractions",
  "approvalStatus", "createdBy", "createdByRole", "approvedBy", "approvedAt",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Himachal Pradesh',
  'Manali',
  'Manali is a high-altitude Himalayan resort town in Himachal Pradesh. Set on the Beas River, it is a gateway for skiing in the Solang Valley and trekking in Parvati Valley.',
  ARRAY[
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800'
  ],
  32.2432,
  77.1892,
  'Nearest airport is Bhuntar (50 km). Well connected by road from Delhi and Chandigarh. Regular bus services available.',
  'Bhuntar Airport',
  '50 km',
  'Joginder Nagar Railway Station',
  '165 km',
  ARRAY['Rohtang Pass', 'Solang Valley', 'Hadimba Temple', 'Vashisht Hot Springs', 'Old Manali'],
  ARRAY['Snow Activities', 'Paragliding', 'River Rafting', 'Nature Walks'],
  'APPROVED',
  (SELECT id FROM "User" WHERE role = 'SITE_ADMIN' LIMIT 1),
  'SITE_ADMIN',
  (SELECT id FROM "User" WHERE role = 'SITE_ADMIN' LIMIT 1),
  NOW(),
  NOW(),
  NOW()
);

-- 5. Tourism Dept - Heritage Site
INSERT INTO "Location" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance", attractions, "kidsAttractions",
  "approvalStatus", "createdBy", "createdByRole", "approvedBy", "approvedAt",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Uttar Pradesh',
  'Agra',
  'Agra is home to the iconic Taj Mahal, one of the Seven Wonders of the World. The city is rich in Mughal heritage with magnificent monuments and historical significance.',
  ARRAY[
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
    'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=800'
  ],
  27.1767,
  78.0081,
  'Agra is well connected by air, rail, and road. Kheria Airport has limited flights. Excellent train connectivity from Delhi and other major cities.',
  'Agra Airport (Kheria)',
  '13 km',
  'Agra Cantt Railway Station',
  '6 km',
  ARRAY['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Itmad-ud-Daulah'],
  ARRAY['Taj Mahal Gardens', 'Wildlife SOS', 'Kalakriti Cultural Show'],
  'APPROVED',
  (SELECT id FROM "User" WHERE role = 'GOVT_DEPARTMENT' LIMIT 1),
  'GOVT_DEPARTMENT',
  (SELECT id FROM "User" WHERE role = 'GOVT_DEPARTMENT' LIMIT 1),
  NOW(),
  NOW(),
  NOW()
);

-- 6. Travel Agent - Beach Destination (Pending)
INSERT INTO "Location" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
  attractions, "kidsAttractions", "approvalStatus", "createdBy", "createdByRole",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Tamil Nadu',
  'Mahabalipuram',
  'Mahabalipuram is a historic town known for its rock-cut temples and sculptures. A UNESCO World Heritage Site with beautiful beaches and ancient monuments.',
  ARRAY[
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800',
    'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800'
  ],
  12.6269,
  80.1932,
  'Located 55 km from Chennai. Well connected by road. Regular buses and taxis available from Chennai.',
  'Chennai International Airport',
  '55 km',
  ARRAY['Shore Temple', 'Pancha Rathas', 'Arjuna''s Penance', 'Mahabalipuram Beach', 'Krishna''s Butterball'],
  ARRAY['Beach Activities', 'Crocodile Bank', 'Sculpture Museum'],
  'PENDING',
  (SELECT id FROM "User" WHERE role = 'TOURIST_GUIDE' LIMIT 1),
  'TOURIST_GUIDE',
  NOW(),
  NOW()
);

-- 7. Admin - Wildlife Destination
INSERT INTO "Location" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance", attractions, "kidsAttractions",
  "approvalStatus", "createdBy", "createdByRole", "approvedBy", "approvedAt",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Madhya Pradesh',
  'Bandhavgarh National Park',
  'Bandhavgarh National Park is one of the best places in India to spot tigers. Known for its high density of Bengal tigers and rich biodiversity.',
  ARRAY[
    'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=800',
    'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=800'
  ],
  23.7011,
  81.0318,
  'Nearest airport is Jabalpur (200 km). Umaria railway station is 35 km away. Road connectivity from major cities.',
  'Jabalpur Airport',
  '200 km',
  'Umaria Railway Station',
  '35 km',
  ARRAY['Tiger Safari', 'Bandhavgarh Fort', 'Nature Trails', 'Bird Watching'],
  ARRAY['Jeep Safari', 'Nature Education', 'Wildlife Photography'],
  'APPROVED',
  (SELECT id FROM "User" WHERE role = 'SITE_ADMIN' LIMIT 1),
  'SITE_ADMIN',
  (SELECT id FROM "User" WHERE role = 'SITE_ADMIN' LIMIT 1),
  NOW(),
  NOW(),
  NOW()
);

-- 8. Tourism Dept - Spiritual Destination
INSERT INTO "Location" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance", attractions, "kidsAttractions",
  "approvalStatus", "createdBy", "createdByRole", "approvedBy", "approvedAt",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Uttarakhand',
  'Rishikesh',
  'Rishikesh is a city in the foothills of the Himalayas, known as the Yoga Capital of the World. Famous for adventure sports, spiritual retreats, and the Ganges River.',
  ARRAY[
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800'
  ],
  30.0869,
  78.2676,
  'Jolly Grant Airport in Dehradun is 35 km away. Rishikesh railway station is well connected. Regular buses from Delhi and other cities.',
  'Jolly Grant Airport, Dehradun',
  '35 km',
  'Rishikesh Railway Station',
  'In city',
  ARRAY['Laxman Jhula', 'Ram Jhula', 'Beatles Ashram', 'Triveni Ghat', 'Neer Garh Waterfall'],
  ARRAY['River Rafting', 'Camping', 'Ganga Aarti', 'Nature Walks'],
  'APPROVED',
  (SELECT id FROM "User" WHERE role = 'GOVT_DEPARTMENT' LIMIT 1),
  'GOVT_DEPARTMENT',
  (SELECT id FROM "User" WHERE role = 'GOVT_DEPARTMENT' LIMIT 1),
  NOW(),
  NOW(),
  NOW()
);

-- 9. Travel Agent - Backwater Destination (Pending)
INSERT INTO "Location" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
  attractions, "kidsAttractions", "approvalStatus", "createdBy", "createdByRole",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Kerala',
  'Alleppey (Alappuzha)',
  'Alleppey is famous for its backwaters, houseboat cruises, and serene canals. Known as the Venice of the East, it offers unique water-based experiences.',
  ARRAY[
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'
  ],
  9.4981,
  76.3388,
  'Cochin International Airport is 85 km away. Alappuzha railway station is well connected. Regular buses and taxis available.',
  'Cochin International Airport',
  '85 km',
  ARRAY['Houseboat Cruise', 'Alleppey Beach', 'Vembanad Lake', 'Marari Beach', 'Krishnapuram Palace'],
  ARRAY['Boat Rides', 'Beach Activities', 'Village Tours'],
  'PENDING',
  (SELECT id FROM "User" WHERE role = 'TOURIST_GUIDE' LIMIT 1),
  'TOURIST_GUIDE',
  NOW(),
  NOW()
);

-- 10. Admin - Desert Destination
INSERT INTO "Location" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance", attractions, "kidsAttractions",
  "approvalStatus", "createdBy", "createdByRole", "approvedBy", "approvedAt",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Rajasthan',
  'Jaisalmer',
  'Jaisalmer, the Golden City, is known for its yellow sandstone architecture and the Thar Desert. Famous for desert safaris, magnificent forts, and cultural experiences.',
  ARRAY[
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'
  ],
  26.9157,
  70.9083,
  'Jaisalmer Airport has limited connectivity. Well connected by train and road from Jodhpur and Jaipur.',
  'Jaisalmer Airport',
  '17 km',
  'Jaisalmer Railway Station',
  '2 km',
  ARRAY['Jaisalmer Fort', 'Sam Sand Dunes', 'Patwon Ki Haveli', 'Gadisar Lake', 'Desert Safari'],
  ARRAY['Camel Rides', 'Desert Camping', 'Cultural Shows', 'Puppet Shows'],
  'APPROVED',
  (SELECT id FROM "User" WHERE role = 'SITE_ADMIN' LIMIT 1),
  'SITE_ADMIN',
  (SELECT id FROM "User" WHERE role = 'SITE_ADMIN' LIMIT 1),
  NOW(),
  NOW(),
  NOW()
);

-- Note: After running this script, you should have:
-- - 5 APPROVED locations (3 from Admin, 2 from Tourism Dept)
-- - 3 PENDING locations (from Travel Agents)
-- This will help test the filtering and status management features
