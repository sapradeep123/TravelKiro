-- Delete all existing locations and related data
-- First delete related records
DELETE FROM "accommodations" WHERE "locationId" IN (SELECT id FROM "locations");
DELETE FROM "packages" WHERE "locationId" IN (SELECT id FROM "locations");
DELETE FROM "events" WHERE "locationId" IN (SELECT id FROM "locations");
DELETE FROM "community_posts" WHERE "locationId" IN (SELECT id FROM "locations");
DELETE FROM "approval_queue" WHERE "contentType" = 'LOCATION';
-- Now delete locations
DELETE FROM "locations";

-- Insert comprehensive sample locations with all new fields

-- Location 1: Munnar, Kerala
INSERT INTO "locations" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach",
  "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance",
  "nearestBusStation", "busStationDistance",
  attractions, "kidsAttractions",
  "createdBy", "createdByRole", "approvalStatus",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Kerala',
  'Munnar',
  'Munnar is a town and hill station in the Idukki district of Kerala. It is situated at around 1,600 metres above sea level in the Western Ghats. Munnar is known for its tea estates, exotic lush greenery and craggy peaks. It is one of the most sought after tourist destinations in South India.',
  ARRAY[
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800'
  ],
  10.0889,
  77.0595,
  'Munnar is well connected by road. You can take a bus or hire a taxi from Kochi, Madurai, or Coimbatore. The scenic drive through winding mountain roads offers breathtaking views of tea plantations and valleys.',
  'Cochin International Airport',
  '110 km (3 hours)',
  'Aluva Railway Station',
  '130 km (4 hours)',
  'Munnar Bus Stand',
  'In town center',
  ARRAY[
    'Eravikulam National Park - Home to the endangered Nilgiri Tahr',
    'Mattupetty Dam - Beautiful reservoir surrounded by hills',
    'Tea Museum - Learn about tea processing and history',
    'Echo Point - Natural echo phenomenon spot',
    'Top Station - Highest point with panoramic views',
    'Kundala Lake - Scenic lake perfect for boating'
  ],
  ARRAY[
    'Elephant Safari at Carmelagiri Elephant Park',
    'Boating at Kundala Lake',
    'Butterfly Garden visit',
    'Tea plantation tour with tasting'
  ],
  (SELECT id FROM users WHERE role = 'SITE_ADMIN' LIMIT 1),
  'SITE_ADMIN',
  'APPROVED',
  NOW(),
  NOW()
);

-- Location 2: Alleppey (Alappuzha), Kerala
INSERT INTO "locations" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach",
  "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance",
  "nearestBusStation", "busStationDistance",
  attractions, "kidsAttractions",
  "createdBy", "createdByRole", "approvalStatus",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Kerala',
  'Alleppey',
  'Alappuzha (or Alleppey) is a city on the Laccadive Sea in southern India. It is best known for houseboat cruises along the rustic Kerala backwaters, a network of tranquil canals and lagoons. The town has a vast network of canals and bridges, earning it the nickname "Venice of the East".',
  ARRAY[
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800',
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800'
  ],
  9.4981,
  76.3388,
  'Alleppey is easily accessible by road, rail, and water. Regular buses and trains connect it to major cities. The most scenic way to arrive is by houseboat from Kumarakom.',
  'Cochin International Airport',
  '85 km (2 hours)',
  'Alappuzha Railway Station',
  'In town center',
  'Alappuzha KSRTC Bus Stand',
  '1 km',
  ARRAY[
    'Backwater Houseboat Cruise - Overnight stay on traditional kettuvallam',
    'Alleppey Beach - Beautiful sunset views',
    'Krishnapuram Palace - 18th century palace with murals',
    'Marari Beach - Pristine beach away from crowds',
    'Pathiramanal Island - Bird sanctuary in Vembanad Lake',
    'Ambalapuzha Temple - Ancient Krishna temple'
  ],
  ARRAY[
    'Houseboat ride with traditional Kerala meals',
    'Beach activities and sandcastle building',
    'Village cycling tours',
    'Coir factory visit to see rope making'
  ],
  (SELECT id FROM users WHERE role = 'SITE_ADMIN' LIMIT 1),
  'SITE_ADMIN',
  'APPROVED',
  NOW(),
  NOW()
);

-- Location 3: Goa Beaches
INSERT INTO "locations" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach",
  "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance",
  "nearestBusStation", "busStationDistance",
  attractions, "kidsAttractions",
  "createdBy", "createdByRole", "approvalStatus",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Goa',
  'North Goa',
  'Goa is a state on India''s western coast with a rich Portuguese heritage. Known for its beaches, ranging from popular stretches at Baga and Palolem to laid-back fishing villages. It has a unique blend of Indian and Portuguese cultures, evident in its architecture, cuisine, and lifestyle.',
  ARRAY[
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800'
  ],
  15.2993,
  74.1240,
  'Goa is well connected by air, rail, and road. Direct flights from major Indian cities. Trains from Mumbai, Bangalore, and Delhi. State and private buses operate regularly from neighboring states.',
  'Goa International Airport (Dabolim)',
  '30 km from Panaji',
  'Madgaon Railway Station',
  '35 km from Panaji',
  'Panaji Bus Stand',
  'City center',
  ARRAY[
    'Baga Beach - Water sports and nightlife',
    'Fort Aguada - 17th century Portuguese fort',
    'Basilica of Bom Jesus - UNESCO World Heritage Site',
    'Dudhsagar Falls - Spectacular four-tiered waterfall',
    'Anjuna Flea Market - Shopping and local culture',
    'Spice Plantations - Guided tours with traditional lunch'
  ],
  ARRAY[
    'Splashdown Water Park',
    'Butterfly Conservatory',
    'Dolphin watching boat trips',
    'Beach activities and sandcastle competitions',
    'Goa Science Centre'
  ],
  (SELECT id FROM users WHERE role = 'SITE_ADMIN' LIMIT 1),
  'SITE_ADMIN',
  'APPROVED',
  NOW(),
  NOW()
);

-- Location 4: Jaipur, Rajasthan
INSERT INTO "locations" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach",
  "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance",
  "nearestBusStation", "busStationDistance",
  attractions, "kidsAttractions",
  "createdBy", "createdByRole", "approvalStatus",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Rajasthan',
  'Jaipur',
  'Jaipur, the Pink City, is the capital of Rajasthan. Known for its stunning palaces, forts, and vibrant culture. The city is a perfect blend of traditional and modern India, with magnificent architecture, colorful bazaars, and rich history dating back to the 18th century.',
  ARRAY[
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800'
  ],
  26.9124,
  75.7873,
  'Jaipur is well connected by air, rail, and road to all major cities in India. The city has excellent infrastructure with regular flights, trains, and buses. It is part of the famous Golden Triangle tourist circuit.',
  'Jaipur International Airport',
  '13 km from city center',
  'Jaipur Junction Railway Station',
  'City center',
  'Sindhi Camp Bus Stand',
  '2 km',
  ARRAY[
    'Amber Fort - Magnificent hilltop fort with elephant rides',
    'City Palace - Royal residence with museums',
    'Hawa Mahal - Iconic Palace of Winds',
    'Jantar Mantar - UNESCO World Heritage astronomical observatory',
    'Nahargarh Fort - Sunset views over the city',
    'Jal Mahal - Palace in the middle of Man Sagar Lake'
  ],
  ARRAY[
    'Elephant ride at Amber Fort',
    'Chokhi Dhani - Traditional Rajasthani village resort',
    'Puppet shows and folk performances',
    'Camel rides',
    'Jaipur Zoo'
  ],
  (SELECT id FROM users WHERE role = 'SITE_ADMIN' LIMIT 1),
  'SITE_ADMIN',
  'APPROVED',
  NOW(),
  NOW()
);

-- Location 5: Manali, Himachal Pradesh
INSERT INTO "locations" (
  id, country, state, area, description, images,
  latitude, longitude, "howToReach",
  "nearestAirport", "airportDistance",
  "nearestRailway", "railwayDistance",
  "nearestBusStation", "busStationDistance",
  attractions, "kidsAttractions",
  "createdBy", "createdByRole", "approvalStatus",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'India',
  'Himachal Pradesh',
  'Manali',
  'Manali is a high-altitude Himalayan resort town in the northern state of Himachal Pradesh. It has a reputation as a backpacking center and honeymoon destination. Set on the Beas River, it is a gateway for skiing in the Solang Valley and trekking in Parvati Valley.',
  ARRAY[
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
  ],
  32.2396,
  77.1887,
  'Manali is accessible by road from Delhi (540 km), Chandigarh (310 km), and Shimla (250 km). The journey offers spectacular mountain views. Volvo buses operate regularly from major cities. The nearest airport and railway station require further road travel.',
  'Bhuntar Airport (Kullu)',
  '50 km (2 hours)',
  'Joginder Nagar Railway Station',
  '165 km (5 hours)',
  'Manali Bus Stand',
  'Town center',
  ARRAY[
    'Rohtang Pass - Snow-covered mountain pass (seasonal)',
    'Solang Valley - Adventure sports and skiing',
    'Hadimba Temple - Ancient cave temple in cedar forest',
    'Old Manali - Hippie village with cafes',
    'Vashisht Hot Springs - Natural thermal springs',
    'Beas River - Rafting and riverside activities'
  ],
  ARRAY[
    'Snow activities at Solang Valley',
    'Yak and horse rides',
    'Van Vihar National Park',
    'Tibetan Monastery visit',
    'Nature walks and picnics'
  ],
  (SELECT id FROM users WHERE role = 'SITE_ADMIN' LIMIT 1),
  'SITE_ADMIN',
  'APPROVED',
  NOW(),
  NOW()
);
