-- Seed data for Accommodations Module
-- This script creates sample accommodations, call requests, interactions, and reviews
-- Run this after running the Prisma migration

-- ============================================
-- STEP 1: Get existing user IDs
-- ============================================
-- You'll need to replace these with actual user IDs from your database
-- Run: SELECT id, email, role FROM users LIMIT 5;

-- For this seed, we'll use variables (PostgreSQL)
DO $$
DECLARE
    admin_user_id UUID;
    site_admin_id UUID;
    tourist_guide_id UUID;
BEGIN
    -- Get existing users or create if needed
    SELECT id INTO admin_user_id FROM users WHERE role = 'SITE_ADMIN' LIMIT 1;
    SELECT id INTO site_admin_id FROM users WHERE role = 'SITE_ADMIN' OFFSET 1 LIMIT 1;
    SELECT id INTO tourist_guide_id FROM users WHERE role = 'TOURIST_GUIDE' LIMIT 1;
    
    -- If no users exist, you'll need to create them first
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No users found. Please create users first.';
        RETURN;
    END IF;

-- ============================================
-- STEP 2: Insert Sample Accommodations
-- ============================================

-- Hotel 1: Luxury Hotel in Mumbai
INSERT INTO accommodations (
    id, type, name, slug, description,
    country, state, area, address, latitude, longitude,
    phone, email, website,
    images, videos, "priceMin", "priceMax", currency, "priceCategory",
    "starRating", "userRating", "reviewCount",
    amenities,
    "isActive", "isFeatured", "approvalStatus",
    "createdBy", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'HOTEL',
    'The Grand Mumbai Palace',
    'the-grand-mumbai-palace',
    'Experience luxury at its finest in the heart of Mumbai. Our 5-star hotel offers world-class amenities, stunning views of the Arabian Sea, and impeccable service.',
    'India', 'Maharashtra', 'Mumbai',
    'Marine Drive, Nariman Point, Mumbai 400021',
    18.9220, 72.8347,
    ARRAY['+91-22-66778899', '+91-22-66778800'],
    'reservations@grandmumbai.com',
    'https://grandmumbai.com',
    ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
    ARRAY[]::TEXT[],
    15000, 50000, 'INR', 'LUXURY',
    5, 4.8, 0,
    ARRAY['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Valet Parking', 'Concierge'],
    true, true, 'APPROVED',
    admin_user_id, NOW(), NOW()
);

-- Hotel 2: Budget Hotel in Delhi
INSERT INTO accommodations (
    id, type, name, slug, description,
    country, state, area, address, latitude, longitude,
    phone, email, website,
    images, videos, "priceMin", "priceMax", currency, "priceCategory",
    "starRating", "userRating", "reviewCount",
    amenities,
    "isActive", "isFeatured", "approvalStatus",
    "createdBy", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'HOTEL',
    'Delhi Budget Inn',
    'delhi-budget-inn',
    'Comfortable and affordable accommodation in the heart of Delhi. Perfect for budget travelers and backpackers.',
    'India', 'Delhi', 'New Delhi',
    'Paharganj, New Delhi 110055',
    28.6448, 77.2167,
    ARRAY['+91-11-23456789'],
    'info@delhibudgetinn.com',
    'https://delhibudgetinn.com',
    ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427'],
    ARRAY[]::TEXT[],
    1500, 3000, 'INR', 'BUDGET',
    2, 4.2, 0,
    ARRAY['WiFi', 'AC', 'Hot Water', 'Laundry'],
    true, false, 'APPROVED',
    admin_user_id, NOW(), NOW()
);

-- Resort 1: Beach Resort in Goa
INSERT INTO accommodations (
    id, type, name, slug, description,
    country, state, area, address, latitude, longitude,
    phone, email, website,
    images, videos, "priceMin", "priceMax", currency, "priceCategory",
    "starRating", "userRating", "reviewCount",
    amenities,
    "isActive", "isFeatured", "approvalStatus",
    "createdBy", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'RESORT',
    'Paradise Beach Resort Goa',
    'paradise-beach-resort-goa',
    'Escape to paradise at our beachfront resort in Goa. Enjoy pristine beaches, water sports, and authentic Goan cuisine.',
    'India', 'Goa', 'Calangute',
    'Calangute Beach Road, Goa 403516',
    15.5430, 73.7554,
    ARRAY['+91-832-2276543', '+91-832-2276544'],
    'bookings@paradisebeachgoa.com',
    'https://paradisebeachgoa.com',
    ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'],
    ARRAY[]::TEXT[],
    8000, 25000, 'INR', 'PREMIUM',
    4, 4.6, 0,
    ARRAY['Beach Access', 'Pool', 'Water Sports', 'Restaurant', 'Bar', 'Spa', 'WiFi', 'Parking'],
    true, true, 'APPROVED',
    admin_user_id, NOW(), NOW()
);

-- Restaurant 1: Fine Dining in Bangalore
INSERT INTO accommodations (
    id, type, name, slug, description,
    country, state, area, address, latitude, longitude,
    phone, email, website,
    images, videos, "priceMin", "priceMax", currency, "priceCategory",
    "starRating", "userRating", "reviewCount",
    amenities, "dietTypes", "cuisineTypes", "seatingCapacity",
    "isActive", "isFeatured", "approvalStatus",
    "createdBy", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'RESTAURANT',
    'Spice Garden Restaurant',
    'spice-garden-restaurant-bangalore',
    'Experience authentic Indian cuisine with a modern twist. Our chefs use locally sourced ingredients to create unforgettable dishes.',
    'India', 'Karnataka', 'Bangalore',
    'MG Road, Bangalore 560001',
    12.9716, 77.5946,
    ARRAY['+91-80-41234567'],
    'reservations@spicegarden.com',
    'https://spicegarden.com',
    ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'],
    ARRAY[]::TEXT[],
    800, 3000, 'INR', 'MID_RANGE',
    4, 4.5, 0,
    ARRAY['WiFi', 'AC', 'Parking', 'Live Music', 'Outdoor Seating'],
    ARRAY['VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN']::diet_type[],
    ARRAY['Indian', 'Continental', 'Asian Fusion'],
    120,
    true, true, 'APPROVED',
    admin_user_id, NOW(), NOW()
);

-- Home Stay 1: Heritage Home in Rajasthan
INSERT INTO accommodations (
    id, type, name, slug, description,
    country, state, area, address, latitude, longitude,
    phone, email, website,
    images, videos, "priceMin", "priceMax", currency, "priceCategory",
    "starRating", "userRating", "reviewCount",
    amenities, "homeStaySubtype", "totalRooms", "sharedFacilities", "privateFacilities", "houseRules", "genderPreference",
    "isActive", "isFeatured", "approvalStatus",
    "createdBy", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'HOME_STAY',
    'Royal Heritage Haveli',
    'royal-heritage-haveli-jaipur',
    'Stay in a 200-year-old heritage haveli in the Pink City. Experience royal Rajasthani hospitality and culture.',
    'India', 'Rajasthan', 'Jaipur',
    'Old City, Jaipur 302001',
    26.9124, 75.7873,
    ARRAY['+91-141-2345678'],
    'stay@royalhaveli.com',
    'https://royalhaveli.com',
    ARRAY['https://images.unsplash.com/photo-1564501049412-61c2a3083791'],
    ARRAY[]::TEXT[],
    3000, 8000, 'INR', 'MID_RANGE',
    NULL, 4.7, 0,
    ARRAY['WiFi', 'Traditional Meals', 'Cultural Programs', 'Guided Tours', 'Parking'],
    'HERITAGE_HOME',
    5,
    ARRAY['Kitchen', 'Living Room', 'Garden'],
    ARRAY['Bathroom', 'AC', 'TV'],
    'No smoking. Respect local customs. Quiet hours after 10 PM.',
    'NO_PREFERENCE',
    true, true, 'APPROVED',
    admin_user_id, NOW(), NOW()
);

-- Shared Flat 1: Budget Accommodation in Pune
INSERT INTO accommodations (
    id, type, name, slug, description,
    country, state, area, address, latitude, longitude,
    phone, email, website,
    images, videos, "priceMin", "priceMax", currency, "priceCategory",
    "starRating", "userRating", "reviewCount",
    amenities, "totalRooms", "sharedFacilities", "privateFacilities", "houseRules", "genderPreference",
    "isActive", "isFeatured", "approvalStatus",
    "createdBy", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'SHARED_FLAT',
    'Pune Student Co-living',
    'pune-student-co-living',
    'Affordable shared accommodation for students and young professionals. Fully furnished with all modern amenities.',
    'India', 'Maharashtra', 'Pune',
    'Koregaon Park, Pune 411001',
    18.5362, 73.8958,
    ARRAY['+91-20-12345678'],
    'hello@punestudent.com',
    'https://punestudent.com',
    ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    ARRAY[]::TEXT[],
    5000, 12000, 'INR', 'BUDGET',
    NULL, 4.3, 0,
    ARRAY['WiFi', 'AC', 'Kitchen', 'Laundry', 'Security', 'Housekeeping'],
    8,
    ARRAY['Kitchen', 'Living Room', 'Laundry', 'Terrace'],
    ARRAY['Bedroom', 'Study Table'],
    'No pets. No parties. Maintain cleanliness.',
    'MIXED',
    true, false, 'APPROVED',
    admin_user_id, NOW(), NOW()
);

-- ============================================
-- STEP 3: Insert Sample Call Requests
-- ============================================

-- Get accommodation IDs for call requests
DECLARE
    hotel_mumbai_id UUID;
    resort_goa_id UUID;
    restaurant_blr_id UUID;
    haveli_jaipur_id UUID;
BEGIN
    SELECT id INTO hotel_mumbai_id FROM accommodations WHERE slug = 'the-grand-mumbai-palace';
    SELECT id INTO resort_goa_id FROM accommodations WHERE slug = 'paradise-beach-resort-goa';
    SELECT id INTO restaurant_blr_id FROM accommodations WHERE slug = 'spice-garden-restaurant-bangalore';
    SELECT id INTO haveli_jaipur_id FROM accommodations WHERE slug = 'royal-heritage-haveli-jaipur';

-- Call Request 1: New Lead
INSERT INTO accommodation_call_requests (
    id, name, phone, email, "preferredCallTime", message,
    "accommodationId", status, priority,
    "assignedTo", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'Rajesh Kumar',
    '+91-9876543210',
    'rajesh.kumar@email.com',
    NOW() + INTERVAL '2 days',
    'Interested in booking for family vacation in December',
    hotel_mumbai_id,
    'NEW',
    'HIGH',
    NULL,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
);

-- Call Request 2: Contacted Lead
INSERT INTO accommodation_call_requests (
    id, name, phone, email, message,
    "accommodationId", status, priority,
    "assignedTo", "assignedAt", "lastContactedAt",
    "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'Priya Sharma',
    '+91-9876543211',
    'priya.sharma@email.com',
    'Looking for weekend getaway package',
    resort_goa_id,
    'CONTACTED',
    'MEDIUM',
    admin_user_id,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '6 hours'
);

-- Call Request 3: Qualified Lead
INSERT INTO accommodation_call_requests (
    id, name, phone, email, message,
    "accommodationId", status, priority,
    "assignedTo", "assignedAt", "lastContactedAt",
    "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'Amit Patel',
    '+91-9876543212',
    'amit.patel@email.com',
    'Corporate event booking for 50 people',
    restaurant_blr_id,
    'QUALIFIED',
    'URGENT',
    admin_user_id,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
);

-- Call Request 4: Follow Up
INSERT INTO accommodation_call_requests (
    id, name, phone, email, message,
    "accommodationId", status, priority,
    "assignedTo", "assignedAt", "lastContactedAt",
    "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'Sneha Reddy',
    '+91-9876543213',
    'sneha.reddy@email.com',
    'Interested in heritage stay experience',
    haveli_jaipur_id,
    'FOLLOW_UP',
    'MEDIUM',
    admin_user_id,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '2 days'
);

-- Call Request 5: Scheduled
INSERT INTO accommodation_call_requests (
    id, name, phone, email, message,
    "accommodationId", status, priority,
    "assignedTo", "assignedAt", "scheduledCallDate",
    "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'Vikram Singh',
    '+91-9876543214',
    'vikram.singh@email.com',
    'Wedding venue inquiry',
    resort_goa_id,
    'SCHEDULED',
    'HIGH',
    admin_user_id,
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '1 day',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
);

-- Call Request 6: Converted
INSERT INTO accommodation_call_requests (
    id, name, phone, email, message,
    "accommodationId", status, priority,
    "assignedTo", "assignedAt", "lastContactedAt", "convertedAt", "conversionValue",
    "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'Anita Desai',
    '+91-9876543215',
    'anita.desai@email.com',
    'Anniversary celebration booking',
    hotel_mumbai_id,
    'CONVERTED',
    'HIGH',
    admin_user_id,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day',
    45000,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '1 day'
);

-- Call Request 7: Lost
INSERT INTO accommodation_call_requests (
    id, name, phone, email, message,
    "accommodationId", status, priority,
    "assignedTo", "assignedAt", "lastContactedAt",
    "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'Rahul Mehta',
    '+91-9876543216',
    'rahul.mehta@email.com',
    'Budget accommodation needed',
    hotel_mumbai_id,
    'LOST',
    'LOW',
    admin_user_id,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '5 days'
);

-- ============================================
-- STEP 4: Insert Call Interactions
-- ============================================

-- Get call request IDs
DECLARE
    contacted_request_id UUID;
    qualified_request_id UUID;
    followup_request_id UUID;
    converted_request_id UUID;
BEGIN
    SELECT id INTO contacted_request_id FROM accommodation_call_requests WHERE phone = '+91-9876543211';
    SELECT id INTO qualified_request_id FROM accommodation_call_requests WHERE phone = '+91-9876543212';
    SELECT id INTO followup_request_id FROM accommodation_call_requests WHERE phone = '+91-9876543213';
    SELECT id INTO converted_request_id FROM accommodation_call_requests WHERE phone = '+91-9876543215';

-- Interaction 1: Initial Call
INSERT INTO call_interactions (
    id, "callRequestId", type, outcome, duration, notes, "nextAction",
    "createdAt", "createdBy"
) VALUES (
    gen_random_uuid(),
    contacted_request_id,
    'CALL',
    'CONNECTED',
    15,
    'Spoke with customer. Interested in 3-night package. Requested detailed pricing.',
    'Send pricing details via email',
    NOW() - INTERVAL '6 hours',
    admin_user_id
);

-- Interaction 2: Email Follow-up
INSERT INTO call_interactions (
    id, "callRequestId", type, notes, "nextAction",
    "createdAt", "createdBy"
) VALUES (
    gen_random_uuid(),
    contacted_request_id,
    'EMAIL',
    'Sent detailed pricing and package information. Included special weekend discount offer.',
    'Follow up call in 2 days',
    NOW() - INTERVAL '5 hours',
    admin_user_id
);

-- Interaction 3: Qualified Lead Call
INSERT INTO call_interactions (
    id, "callRequestId", type, outcome, duration, notes, "nextAction", "followUpDate",
    "createdAt", "createdBy"
) VALUES (
    gen_random_uuid(),
    qualified_request_id,
    'CALL',
    'CONNECTED',
    25,
    'Corporate event for 50 people. Budget confirmed at 2.5L. Needs customized menu.',
    'Prepare proposal with menu options',
    NOW() + INTERVAL '2 days',
    NOW() - INTERVAL '1 day',
    admin_user_id
);

-- Interaction 4: WhatsApp Message
INSERT INTO call_interactions (
    id, "callRequestId", type, notes,
    "createdAt", "createdBy"
) VALUES (
    gen_random_uuid(),
    followup_request_id,
    'WHATSAPP',
    'Sent photos of heritage rooms and cultural program schedule. Customer very interested.',
    NOW() - INTERVAL '2 days',
    admin_user_id
);

-- Interaction 5: Conversion Call
INSERT INTO call_interactions (
    id, "callRequestId", type, outcome, duration, notes,
    "createdAt", "createdBy"
) VALUES (
    gen_random_uuid(),
    converted_request_id,
    'CALL',
    'CONNECTED',
    20,
    'Booking confirmed! 2 nights in premium suite. Payment received. Sent confirmation email.',
    NOW() - INTERVAL '1 day',
    admin_user_id
);

-- ============================================
-- STEP 5: Insert Status History
-- ============================================

-- Status history for contacted request
INSERT INTO call_status_history (
    id, "callRequestId", "fromStatus", "toStatus", notes,
    "createdAt", "createdBy"
) VALUES (
    gen_random_uuid(),
    contacted_request_id,
    'NEW',
    'CONTACTED',
    'First contact made successfully',
    NOW() - INTERVAL '6 hours',
    admin_user_id
);

-- Status history for qualified request
INSERT INTO call_status_history (
    id, "callRequestId", "fromStatus", "toStatus", notes,
    "createdAt", "createdBy"
) VALUES (
    gen_random_uuid(),
    qualified_request_id,
    'NEW',
    'CONTACTED',
    'Initial contact established',
    NOW() - INTERVAL '4 days',
    admin_user_id
),
(
    gen_random_uuid(),
    qualified_request_id,
    'CONTACTED',
    'QUALIFIED',
    'Budget confirmed, requirements clear',
    NOW() - INTERVAL '1 day',
    admin_user_id
);

-- Status history for converted request
INSERT INTO call_status_history (
    id, "callRequestId", "fromStatus", "toStatus", notes,
    "createdAt", "createdBy"
) VALUES (
    gen_random_uuid(),
    converted_request_id,
    'NEW',
    'CONTACTED',
    'Customer responded positively',
    NOW() - INTERVAL '10 days',
    admin_user_id
),
(
    gen_random_uuid(),
    converted_request_id,
    'CONTACTED',
    'QUALIFIED',
    'Budget and dates confirmed',
    NOW() - INTERVAL '7 days',
    admin_user_id
),
(
    gen_random_uuid(),
    converted_request_id,
    'QUALIFIED',
    'SCHEDULED',
    'Site visit scheduled',
    NOW() - INTERVAL '5 days',
    admin_user_id
),
(
    gen_random_uuid(),
    converted_request_id,
    'SCHEDULED',
    'CONVERTED',
    'Booking confirmed and payment received',
    NOW() - INTERVAL '1 day',
    admin_user_id
);

-- ============================================
-- STEP 6: Insert Sample Reviews
-- ============================================

-- Review 1: For Mumbai Hotel
INSERT INTO accommodation_reviews (
    id, "accommodationId", "userId", rating, title, review,
    "isApproved", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    hotel_mumbai_id,
    tourist_guide_id,
    5,
    'Absolutely Stunning!',
    'The Grand Mumbai Palace exceeded all expectations. The sea view from our room was breathtaking, staff was incredibly courteous, and the food was exceptional. Will definitely return!',
    true,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
);

-- Review 2: For Goa Resort
INSERT INTO accommodation_reviews (
    id, "accommodationId", "userId", rating, title, review,
    "isApproved", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    resort_goa_id,
    tourist_guide_id,
    4,
    'Perfect Beach Getaway',
    'Had an amazing time at Paradise Beach Resort. The beach access was convenient, water sports were fun, and the sunset views were magical. Only minor issue was the WiFi speed.',
    true,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
);

-- Review 3: For Bangalore Restaurant
INSERT INTO accommodation_reviews (
    id, "accommodationId", "userId", rating, title, review,
    "isApproved", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    restaurant_blr_id,
    tourist_guide_id,
    5,
    'Culinary Excellence',
    'Spice Garden is a gem! The fusion of traditional and modern flavors is outstanding. The ambiance is perfect for both family dinners and business meetings. Highly recommended!',
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
);

END;
END;
$$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check accommodations
SELECT COUNT(*) as total_accommodations, type, "approvalStatus" 
FROM accommodations 
GROUP BY type, "approvalStatus";

-- Check call requests by status
SELECT status, COUNT(*) as count 
FROM accommodation_call_requests 
GROUP BY status 
ORDER BY 
    CASE status
        WHEN 'NEW' THEN 1
        WHEN 'CONTACTED' THEN 2
        WHEN 'QUALIFIED' THEN 3
        WHEN 'FOLLOW_UP' THEN 4
        WHEN 'SCHEDULED' THEN 5
        WHEN 'CONVERTED' THEN 6
        WHEN 'LOST' THEN 7
        ELSE 8
    END;

-- Check interactions
SELECT COUNT(*) as total_interactions, type 
FROM call_interactions 
GROUP BY type;

-- Check reviews
SELECT COUNT(*) as total_reviews, "isApproved" 
FROM accommodation_reviews 
GROUP BY "isApproved";

-- Summary
SELECT 
    (SELECT COUNT(*) FROM accommodations) as total_accommodations,
    (SELECT COUNT(*) FROM accommodation_call_requests) as total_call_requests,
    (SELECT COUNT(*) FROM call_interactions) as total_interactions,
    (SELECT COUNT(*) FROM accommodation_reviews) as total_reviews;
