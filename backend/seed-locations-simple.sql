-- Simple Location Seed Data
-- This creates sample locations using the first available users of each role

-- Get the first SITE_ADMIN user ID
DO $$
DECLARE
  admin_id UUID;
  govt_id UUID;
  guide_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO admin_id FROM "User" WHERE role = 'SITE_ADMIN' LIMIT 1;
  SELECT id INTO govt_id FROM "User" WHERE role = 'GOVT_DEPARTMENT' LIMIT 1;
  SELECT id INTO guide_id FROM "User" WHERE role = 'TOURIST_GUIDE' LIMIT 1;

  -- If no users exist, create them
  IF admin_id IS NULL THEN
    INSERT INTO "User" (id, email, password, role, "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'admin@test.com', '$2b$10$abcdefghijklmnopqrstuv', 'SITE_ADMIN', true, NOW(), NOW())
    RETURNING id INTO admin_id;
    
    INSERT INTO "UserProfile" (id, "userId", name, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), admin_id, 'Admin User', NOW(), NOW());
  END IF;

  IF govt_id IS NULL THEN
    INSERT INTO "User" (id, email, password, role, "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'tourism@test.com', '$2b$10$abcdefghijklmnopqrstuv', 'GOVT_DEPARTMENT', true, NOW(), NOW())
    RETURNING id INTO govt_id;
    
    INSERT INTO "UserProfile" (id, "userId", name, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), govt_id, 'Tourism Department', NOW(), NOW());
  END IF;

  IF guide_id IS NULL THEN
    INSERT INTO "User" (id, email, password, role, "isActive", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'guide@test.com', '$2b$10$abcdefghijklmnopqrstuv', 'TOURIST_GUIDE', true, NOW(), NOW())
    RETURNING id INTO guide_id;
    
    INSERT INTO "UserProfile" (id, "userId", name, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), guide_id, 'Travel Guide', NOW(), NOW());
  END IF;

  -- Insert sample locations
  
  -- 1. Munnar (Admin - Approved)
  INSERT INTO "Location" (
    id, country, state, area, description, images, 
    latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
    "nearestRailway", "railwayDistance", "nearestBusStation", "busStationDistance",
    attractions, "kidsAttractions", "approvalStatus", "createdBy", "createdByRole",
    "approvedBy", "approvedAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(), 'India', 'Kerala', 'Munnar',
    'Munnar is a town and hill station in the Idukki district of Kerala. Known for its tea estates, exotic lush greenery and craggy peaks.',
    ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800'],
    10.0889, 77.0595,
    'Munnar is well connected by road. The nearest airport is Cochin International Airport (110 km).',
    'Cochin International Airport', '110 km',
    'Aluva Railway Station', '108 km',
    'Munnar Bus Stand', 'In town',
    ARRAY['Tea Gardens', 'Eravikulam National Park', 'Mattupetty Dam', 'Echo Point'],
    ARRAY['Echo Point', 'Kundala Lake', 'Rose Garden'],
    'APPROVED', admin_id, 'SITE_ADMIN', admin_id, NOW(), NOW(), NOW()
  );

  -- 2. Jaipur (Tourism Dept - Approved)
  INSERT INTO "Location" (
    id, country, state, area, description, images,
    latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
    attractions, "kidsAttractions", "approvalStatus", "createdBy", "createdByRole",
    "approvedBy", "approvedAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(), 'India', 'Rajasthan', 'Jaipur',
    'Jaipur, the Pink City, is the capital of Rajasthan. Known for its rich history, magnificent forts, and vibrant culture.',
    ARRAY['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'],
    26.9124, 75.7873,
    'Jaipur is well connected by air, rail, and road. Jaipur International Airport has flights from major Indian cities.',
    'Jaipur International Airport', '12 km',
    ARRAY['Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar'],
    ARRAY['Chokhi Dhani', 'Jaipur Zoo', 'Fun Kingdom'],
    'APPROVED', govt_id, 'GOVT_DEPARTMENT', govt_id, NOW(), NOW(), NOW()
  );

  -- 3. Goa (Travel Guide - Pending)
  INSERT INTO "Location" (
    id, country, state, area, description, images,
    latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
    attractions, "kidsAttractions", "approvalStatus", "createdBy", "createdByRole",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(), 'India', 'Goa', 'North Goa',
    'North Goa is famous for its beautiful beaches, vibrant nightlife, and Portuguese heritage.',
    ARRAY['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800'],
    15.5057, 73.9200,
    'Goa International Airport (Dabolim) is 40 km away. Well connected by trains and buses.',
    'Goa International Airport', '40 km',
    ARRAY['Baga Beach', 'Calangute Beach', 'Fort Aguada', 'Chapora Fort'],
    ARRAY['Splashdown Waterpark', 'Dolphin Watching', 'Beach Activities'],
    'PENDING', guide_id, 'TOURIST_GUIDE', NOW(), NOW()
  );

  -- 4. Manali (Admin - Approved)
  INSERT INTO "Location" (
    id, country, state, area, description, images,
    latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
    attractions, "kidsAttractions", "approvalStatus", "createdBy", "createdByRole",
    "approvedBy", "approvedAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(), 'India', 'Himachal Pradesh', 'Manali',
    'Manali is a high-altitude Himalayan resort town. Set on the Beas River, it is a gateway for skiing and trekking.',
    ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800'],
    32.2432, 77.1892,
    'Nearest airport is Bhuntar (50 km). Well connected by road from Delhi and Chandigarh.',
    'Bhuntar Airport', '50 km',
    ARRAY['Rohtang Pass', 'Solang Valley', 'Hadimba Temple', 'Old Manali'],
    ARRAY['Snow Activities', 'Paragliding', 'River Rafting'],
    'APPROVED', admin_id, 'SITE_ADMIN', admin_id, NOW(), NOW(), NOW()
  );

  -- 5. Agra (Tourism Dept - Approved)
  INSERT INTO "Location" (
    id, country, state, area, description, images,
    latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
    attractions, "kidsAttractions", "approvalStatus", "createdBy", "createdByRole",
    "approvedBy", "approvedAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(), 'India', 'Uttar Pradesh', 'Agra',
    'Agra is home to the iconic Taj Mahal, one of the Seven Wonders of the World.',
    ARRAY['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'],
    27.1767, 78.0081,
    'Agra is well connected by air, rail, and road. Excellent train connectivity from Delhi.',
    'Agra Airport', '13 km',
    ARRAY['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh'],
    ARRAY['Taj Mahal Gardens', 'Wildlife SOS'],
    'APPROVED', govt_id, 'GOVT_DEPARTMENT', govt_id, NOW(), NOW(), NOW()
  );

  -- 6. Alleppey (Travel Guide - Pending)
  INSERT INTO "Location" (
    id, country, state, area, description, images,
    latitude, longitude, "howToReach", "nearestAirport", "airportDistance",
    attractions, "kidsAttractions", "approvalStatus", "createdBy", "createdByRole",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(), 'India', 'Kerala', 'Alleppey',
    'Alleppey is famous for its backwaters, houseboat cruises, and serene canals. Known as the Venice of the East.',
    ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800'],
    9.4981, 76.3388,
    'Cochin International Airport is 85 km away. Regular buses and taxis available.',
    'Cochin International Airport', '85 km',
    ARRAY['Houseboat Cruise', 'Alleppey Beach', 'Vembanad Lake', 'Marari Beach'],
    ARRAY['Boat Rides', 'Beach Activities', 'Village Tours'],
    'PENDING', guide_id, 'TOURIST_GUIDE', NOW(), NOW()
  );

  RAISE NOTICE 'Successfully inserted 6 sample locations!';
END $$;
