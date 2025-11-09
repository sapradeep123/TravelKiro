-- Sample Events Data for Testing
-- This script inserts diverse future events from different sources

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

  -- Insert sample events (all future dates)
  
  -- 1. Diwali Festival (Admin - Active)
  INSERT INTO "Event" (
    id, title, description, "eventType", venue,
    "customCountry", "customState", "customArea",
    "startDate", "endDate", images,
    "nearestAirport", "airportDistance",
    "nearestRailway", "railwayDistance",
    "nearestBusStation", "busStationDistance",
    "hostId", "hostRole", "approvalStatus", "isActive",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Diwali Festival 2025',
    'Grand Diwali celebration with traditional rituals, fireworks, cultural performances, and food stalls. Experience the festival of lights in its full glory.',
    'Festival',
    'City Central Park',
    'India', 'Maharashtra', 'Mumbai',
    (NOW() + INTERVAL '30 days')::DATE,
    (NOW() + INTERVAL '32 days')::DATE,
    ARRAY['https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800'],
    'Chhatrapati Shivaji International Airport', '15 km',
    'Mumbai Central Railway Station', '8 km',
    'Mumbai Central Bus Depot', '5 km',
    admin_id, 'SITE_ADMIN', 'APPROVED', true,
    NOW(), NOW()
  );

  -- 2. Goa Music Festival (Tourism Dept - Active)
  INSERT INTO "Event" (
    id, title, description, "eventType", venue,
    "customCountry", "customState", "customArea",
    "startDate", "endDate", images,
    "nearestAirport", "airportDistance",
    "nearestRailway", "railwayDistance",
    "hostId", "hostRole", "approvalStatus", "isActive",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Goa Sunburn Festival 2025',
    'Asia''s biggest electronic music festival featuring international DJs, beach parties, and non-stop entertainment.',
    'Concert',
    'Vagator Beach',
    'India', 'Goa', 'North Goa',
    (NOW() + INTERVAL '60 days')::DATE,
    (NOW() + INTERVAL '63 days')::DATE,
    ARRAY['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800'],
    'Goa International Airport', '40 km',
    'Thivim Railway Station', '25 km',
    govt_id, 'GOVT_DEPARTMENT', 'APPROVED', true,
    NOW(), NOW()
  );

  -- 3. Jaipur Literature Festival (Admin - Active)
  INSERT INTO "Event" (
    id, title, description, "eventType", venue,
    "customCountry", "customState", "customArea",
    "startDate", "endDate", images,
    "nearestAirport", "airportDistance",
    "nearestRailway", "railwayDistance",
    "hostId", "hostRole", "approvalStatus", "isActive",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Jaipur Literature Festival 2025',
    'World''s largest free literary festival featuring renowned authors, poets, and thinkers from around the globe.',
    'Cultural',
    'Diggi Palace',
    'India', 'Rajasthan', 'Jaipur',
    (NOW() + INTERVAL '90 days')::DATE,
    (NOW() + INTERVAL '95 days')::DATE,
    ARRAY['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'],
    'Jaipur International Airport', '12 km',
    'Jaipur Junction', '5 km',
    admin_id, 'SITE_ADMIN', 'APPROVED', true,
    NOW(), NOW()
  );

  -- 4. Kerala Boat Race (Tourism Dept - Active)
  INSERT INTO "Event" (
    id, title, description, "eventType", venue,
    "customCountry", "customState", "customArea",
    "startDate", "endDate", images,
    "nearestAirport", "airportDistance",
    "nearestRailway", "railwayDistance",
    "hostId", "hostRole", "approvalStatus", "isActive",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Nehru Trophy Boat Race 2025',
    'Famous snake boat race in the backwaters of Kerala. Watch traditional chundan vallams compete in this spectacular event.',
    'Sports',
    'Punnamada Lake',
    'India', 'Kerala', 'Alappuzha',
    (NOW() + INTERVAL '120 days')::DATE,
    (NOW() + INTERVAL '121 days')::DATE,
    ARRAY['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800'],
    'Cochin International Airport', '85 km',
    'Alappuzha Railway Station', '3 km',
    govt_id, 'GOVT_DEPARTMENT', 'APPROVED', true,
    NOW(), NOW()
  );

  -- 5. Pushkar Camel Fair (Admin - Active)
  INSERT INTO "Event" (
    id, title, description, "eventType", venue,
    "customCountry", "customState", "customArea",
    "startDate", "endDate", images,
    "nearestAirport", "airportDistance",
    "nearestRailway", "railwayDistance",
    "hostId", "hostRole", "approvalStatus", "isActive",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Pushkar Camel Fair 2025',
    'One of the world''s largest camel fairs featuring livestock trading, cultural events, and traditional competitions.',
    'Festival',
    'Pushkar Fairground',
    'India', 'Rajasthan', 'Pushkar',
    (NOW() + INTERVAL '150 days')::DATE,
    (NOW() + INTERVAL '157 days')::DATE,
    ARRAY['https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800'],
    'Jaipur International Airport', '145 km',
    'Ajmer Railway Station', '15 km',
    admin_id, 'SITE_ADMIN', 'APPROVED', true,
    NOW(), NOW()
  );

  -- 6. Hampi Utsav (Tourism Dept - Inactive for testing)
  INSERT INTO "Event" (
    id, title, description, "eventType", venue,
    "customCountry", "customState", "customArea",
    "startDate", "endDate", images,
    "nearestAirport", "airportDistance",
    "hostId", "hostRole", "approvalStatus", "isActive",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Hampi Utsav 2025',
    'Cultural extravaganza celebrating the heritage of Hampi with dance, music, and traditional performances.',
    'Cultural',
    'Hampi Ruins',
    'India', 'Karnataka', 'Hampi',
    (NOW() + INTERVAL '180 days')::DATE,
    (NOW() + INTERVAL '183 days')::DATE,
    ARRAY['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'],
    'Hubli Airport', '140 km',
    govt_id, 'GOVT_DEPARTMENT', 'APPROVED', false,
    NOW(), NOW()
  );

  -- 7. Holi Festival (Admin - Active)
  INSERT INTO "Event" (
    id, title, description, "eventType", venue,
    "customCountry", "customState", "customArea",
    "startDate", "endDate", images,
    "nearestAirport", "airportDistance",
    "nearestRailway", "railwayDistance",
    "hostId", "hostRole", "approvalStatus", "isActive",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Holi Festival of Colors 2025',
    'Celebrate the festival of colors with music, dance, and traditional colors. A joyous celebration of spring.',
    'Festival',
    'Mathura Temple Complex',
    'India', 'Uttar Pradesh', 'Mathura',
    (NOW() + INTERVAL '210 days')::DATE,
    (NOW() + INTERVAL '211 days')::DATE,
    ARRAY['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'],
    'Indira Gandhi International Airport', '150 km',
    'Mathura Junction', '2 km',
    admin_id, 'SITE_ADMIN', 'APPROVED', true,
    NOW(), NOW()
  );

  -- 8. Manali Winter Carnival (Tourism Dept - Active)
  INSERT INTO "Event" (
    id, title, description, "eventType", venue,
    "customCountry", "customState", "customArea",
    "startDate", "endDate", images,
    "nearestAirport", "airportDistance",
    "nearestRailway", "railwayDistance",
    "hostId", "hostRole", "approvalStatus", "isActive",
    "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid(),
    'Manali Winter Carnival 2025',
    'Winter sports festival featuring skiing, snowboarding, ice skating, and cultural performances in the snow.',
    'Sports',
    'Manali Mall Road',
    'India', 'Himachal Pradesh', 'Manali',
    (NOW() + INTERVAL '240 days')::DATE,
    (NOW() + INTERVAL '245 days')::DATE,
    ARRAY['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800'],
    'Bhuntar Airport', '50 km',
    'Joginder Nagar Railway Station', '165 km',
    govt_id, 'GOVT_DEPARTMENT', 'APPROVED', true,
    NOW(), NOW()
  );

  RAISE NOTICE 'Successfully inserted 8 sample events!';
END $$;
