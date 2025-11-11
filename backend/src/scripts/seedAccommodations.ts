import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting accommodation seed...\n');

  // Get an existing admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: 'SITE_ADMIN' }
  });

  if (!adminUser) {
    console.error('❌ No SITE_ADMIN user found. Please create one first.');
    console.log('You can create one through the registration endpoint or Prisma Studio.');
    return;
  }

  console.log(`✅ Using admin user: ${adminUser.email}\n`);

  // Create accommodations
  console.log('Creating accommodations...');
  
  const hotel1 = await prisma.accommodation.create({
    data: {
      type: 'HOTEL',
      name: 'The Grand Mumbai Palace',
      slug: 'the-grand-mumbai-palace',
      description: 'Experience luxury at its finest in the heart of Mumbai. Our 5-star hotel offers world-class amenities, stunning views of the Arabian Sea, and impeccable service.',
      country: 'India',
      state: 'Maharashtra',
      area: 'Mumbai',
      address: 'Marine Drive, Nariman Point, Mumbai 400021',
      latitude: 18.9220,
      longitude: 72.8347,
      phone: ['+91-22-66778899', '+91-22-66778800'],
      email: 'reservations@grandmumbai.com',
      website: 'https://grandmumbai.com',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
      videos: [],
      priceMin: 15000,
      priceMax: 50000,
      currency: 'INR',
      priceCategory: 'LUXURY',
      starRating: 5,
      userRating: 4.8,
      reviewCount: 0,
      amenities: ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Valet Parking', 'Concierge'],
      isActive: true,
      isFeatured: true,
      approvalStatus: 'APPROVED',
      createdBy: adminUser.id,
    }
  });
  console.log(`  ✓ Created: ${hotel1.name}`);

  const hotel2 = await prisma.accommodation.create({
    data: {
      type: 'HOTEL',
      name: 'Delhi Budget Inn',
      slug: 'delhi-budget-inn',
      description: 'Comfortable and affordable accommodation in the heart of Delhi. Perfect for budget travelers and backpackers.',
      country: 'India',
      state: 'Delhi',
      area: 'New Delhi',
      address: 'Paharganj, New Delhi 110055',
      latitude: 28.6448,
      longitude: 77.2167,
      phone: ['+91-11-23456789'],
      email: 'info@delhibudgetinn.com',
      website: 'https://delhibudgetinn.com',
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427'],
      videos: [],
      priceMin: 1500,
      priceMax: 3000,
      currency: 'INR',
      priceCategory: 'BUDGET',
      starRating: 2,
      userRating: 4.2,
      reviewCount: 0,
      amenities: ['WiFi', 'AC', 'Hot Water', 'Laundry'],
      isActive: true,
      isFeatured: false,
      approvalStatus: 'APPROVED',
      createdBy: adminUser.id,
    }
  });
  console.log(`  ✓ Created: ${hotel2.name}`);

  const resort1 = await prisma.accommodation.create({
    data: {
      type: 'RESORT',
      name: 'Paradise Beach Resort Goa',
      slug: 'paradise-beach-resort-goa',
      description: 'Escape to paradise at our beachfront resort in Goa. Enjoy pristine beaches, water sports, and authentic Goan cuisine.',
      country: 'India',
      state: 'Goa',
      area: 'Calangute',
      address: 'Calangute Beach Road, Goa 403516',
      latitude: 15.5430,
      longitude: 73.7554,
      phone: ['+91-832-2276543', '+91-832-2276544'],
      email: 'bookings@paradisebeachgoa.com',
      website: 'https://paradisebeachgoa.com',
      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d'],
      videos: [],
      priceMin: 8000,
      priceMax: 25000,
      currency: 'INR',
      priceCategory: 'PREMIUM',
      starRating: 4,
      userRating: 4.6,
      reviewCount: 0,
      amenities: ['Beach Access', 'Pool', 'Water Sports', 'Restaurant', 'Bar', 'Spa', 'WiFi', 'Parking'],
      isActive: true,
      isFeatured: true,
      approvalStatus: 'APPROVED',
      createdBy: adminUser.id,
    }
  });
  console.log(`  ✓ Created: ${resort1.name}`);

  const restaurant1 = await prisma.accommodation.create({
    data: {
      type: 'RESTAURANT',
      name: 'Spice Garden Restaurant',
      slug: 'spice-garden-restaurant-bangalore',
      description: 'Experience authentic Indian cuisine with a modern twist. Our chefs use locally sourced ingredients to create unforgettable dishes.',
      country: 'India',
      state: 'Karnataka',
      area: 'Bangalore',
      address: 'MG Road, Bangalore 560001',
      latitude: 12.9716,
      longitude: 77.5946,
      phone: ['+91-80-41234567'],
      email: 'reservations@spicegarden.com',
      website: 'https://spicegarden.com',
      images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'],
      videos: [],
      priceMin: 800,
      priceMax: 3000,
      currency: 'INR',
      priceCategory: 'MID_RANGE',
      starRating: 4,
      userRating: 4.5,
      reviewCount: 0,
      amenities: ['WiFi', 'AC', 'Parking', 'Live Music', 'Outdoor Seating'],
      dietTypes: ['VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN'],
      cuisineTypes: ['Indian', 'Continental', 'Asian Fusion'],
      seatingCapacity: 120,
      isActive: true,
      isFeatured: true,
      approvalStatus: 'APPROVED',
      createdBy: adminUser.id,
    }
  });
  console.log(`  ✓ Created: ${restaurant1.name}`);

  const homeStay1 = await prisma.accommodation.create({
    data: {
      type: 'HOME_STAY',
      name: 'Royal Heritage Haveli',
      slug: 'royal-heritage-haveli-jaipur',
      description: 'Stay in a 200-year-old heritage haveli in the Pink City. Experience royal Rajasthani hospitality and culture.',
      country: 'India',
      state: 'Rajasthan',
      area: 'Jaipur',
      address: 'Old City, Jaipur 302001',
      latitude: 26.9124,
      longitude: 75.7873,
      phone: ['+91-141-2345678'],
      email: 'stay@royalhaveli.com',
      website: 'https://royalhaveli.com',
      images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791'],
      videos: [],
      priceMin: 3000,
      priceMax: 8000,
      currency: 'INR',
      priceCategory: 'MID_RANGE',
      userRating: 4.7,
      reviewCount: 0,
      amenities: ['WiFi', 'Traditional Meals', 'Cultural Programs', 'Guided Tours', 'Parking'],
      homeStaySubtype: 'HERITAGE_HOME',
      totalRooms: 5,
      sharedFacilities: ['Kitchen', 'Living Room', 'Garden'],
      privateFacilities: ['Bathroom', 'AC', 'TV'],
      houseRules: 'No smoking. Respect local customs. Quiet hours after 10 PM.',
      genderPreference: 'NO_PREFERENCE',
      isActive: true,
      isFeatured: true,
      approvalStatus: 'APPROVED',
      createdBy: adminUser.id,
    }
  });
  console.log(`  ✓ Created: ${homeStay1.name}`);

  const sharedFlat1 = await prisma.accommodation.create({
    data: {
      type: 'SHARED_FLAT',
      name: 'Pune Student Co-living',
      slug: 'pune-student-co-living',
      description: 'Affordable shared accommodation for students and young professionals. Fully furnished with all modern amenities.',
      country: 'India',
      state: 'Maharashtra',
      area: 'Pune',
      address: 'Koregaon Park, Pune 411001',
      latitude: 18.5362,
      longitude: 73.8958,
      phone: ['+91-20-12345678'],
      email: 'hello@punestudent.com',
      website: 'https://punestudent.com',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
      videos: [],
      priceMin: 5000,
      priceMax: 12000,
      currency: 'INR',
      priceCategory: 'BUDGET',
      userRating: 4.3,
      reviewCount: 0,
      amenities: ['WiFi', 'AC', 'Kitchen', 'Laundry', 'Security', 'Housekeeping'],
      totalRooms: 8,
      sharedFacilities: ['Kitchen', 'Living Room', 'Laundry', 'Terrace'],
      privateFacilities: ['Bedroom', 'Study Table'],
      houseRules: 'No pets. No parties. Maintain cleanliness.',
      genderPreference: 'MIXED',
      isActive: true,
      isFeatured: false,
      approvalStatus: 'APPROVED',
      createdBy: adminUser.id,
    }
  });
  console.log(`  ✓ Created: ${sharedFlat1.name}\n`);

  // Create call requests
  console.log('Creating call requests...');

  const callReq1 = await prisma.accommodationCallRequest.create({
    data: {
      name: 'Rajesh Kumar',
      phone: '+91-9876543210',
      email: 'rajesh.kumar@email.com',
      preferredCallTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      message: 'Interested in booking for family vacation in December',
      accommodationId: hotel1.id,
      status: 'NEW',
      priority: 'HIGH',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    }
  });
  console.log(`  ✓ Created NEW lead: ${callReq1.name}`);

  const callReq2 = await prisma.accommodationCallRequest.create({
    data: {
      name: 'Priya Sharma',
      phone: '+91-9876543211',
      email: 'priya.sharma@email.com',
      message: 'Looking for weekend getaway package',
      accommodationId: resort1.id,
      status: 'CONTACTED',
      priority: 'MEDIUM',
      assignedTo: adminUser.id,
      assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastContactedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
  });
  console.log(`  ✓ Created CONTACTED lead: ${callReq2.name}`);

  const callReq3 = await prisma.accommodationCallRequest.create({
    data: {
      name: 'Amit Patel',
      phone: '+91-9876543212',
      email: 'amit.patel@email.com',
      message: 'Corporate event booking for 50 people',
      accommodationId: restaurant1.id,
      status: 'QUALIFIED',
      priority: 'URGENT',
      assignedTo: adminUser.id,
      assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    }
  });
  console.log(`  ✓ Created QUALIFIED lead: ${callReq3.name}`);

  const callReq4 = await prisma.accommodationCallRequest.create({
    data: {
      name: 'Sneha Reddy',
      phone: '+91-9876543213',
      email: 'sneha.reddy@email.com',
      message: 'Interested in heritage stay experience',
      accommodationId: homeStay1.id,
      status: 'FOLLOW_UP',
      priority: 'MEDIUM',
      assignedTo: adminUser.id,
      assignedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    }
  });
  console.log(`  ✓ Created FOLLOW_UP lead: ${callReq4.name}`);

  const callReq5 = await prisma.accommodationCallRequest.create({
    data: {
      name: 'Vikram Singh',
      phone: '+91-9876543214',
      email: 'vikram.singh@email.com',
      message: 'Wedding venue inquiry',
      accommodationId: resort1.id,
      status: 'SCHEDULED',
      priority: 'HIGH',
      assignedTo: adminUser.id,
      assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      scheduledCallDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    }
  });
  console.log(`  ✓ Created SCHEDULED lead: ${callReq5.name}`);

  const callReq6 = await prisma.accommodationCallRequest.create({
    data: {
      name: 'Anita Desai',
      phone: '+91-9876543215',
      email: 'anita.desai@email.com',
      message: 'Anniversary celebration booking',
      accommodationId: hotel1.id,
      status: 'CONVERTED',
      priority: 'HIGH',
      assignedTo: adminUser.id,
      assignedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastContactedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      convertedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      conversionValue: 45000,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    }
  });
  console.log(`  ✓ Created CONVERTED lead: ${callReq6.name}`);

  const callReq7 = await prisma.accommodationCallRequest.create({
    data: {
      name: 'Rahul Mehta',
      phone: '+91-9876543216',
      email: 'rahul.mehta@email.com',
      message: 'Budget accommodation needed',
      accommodationId: hotel1.id,
      status: 'LOST',
      priority: 'LOW',
      assignedTo: adminUser.id,
      assignedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      lastContactedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    }
  });
  console.log(`  ✓ Created LOST lead: ${callReq7.name}\n`);

  // Create interactions
  console.log('Creating interactions...');

  await prisma.callInteraction.create({
    data: {
      callRequestId: callReq2.id,
      type: 'CALL',
      outcome: 'CONNECTED',
      duration: 15,
      notes: 'Spoke with customer. Interested in 3-night package. Requested detailed pricing.',
      nextAction: 'Send pricing details via email',
      createdBy: adminUser.id,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    }
  });

  await prisma.callInteraction.create({
    data: {
      callRequestId: callReq2.id,
      type: 'EMAIL',
      notes: 'Sent detailed pricing and package information. Included special weekend discount offer.',
      nextAction: 'Follow up call in 2 days',
      createdBy: adminUser.id,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    }
  });

  await prisma.callInteraction.create({
    data: {
      callRequestId: callReq3.id,
      type: 'CALL',
      outcome: 'CONNECTED',
      duration: 25,
      notes: 'Corporate event for 50 people. Budget confirmed at 2.5L. Needs customized menu.',
      nextAction: 'Prepare proposal with menu options',
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      createdBy: adminUser.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }
  });

  await prisma.callInteraction.create({
    data: {
      callRequestId: callReq4.id,
      type: 'WHATSAPP',
      notes: 'Sent photos of heritage rooms and cultural program schedule. Customer very interested.',
      createdBy: adminUser.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
  });

  await prisma.callInteraction.create({
    data: {
      callRequestId: callReq6.id,
      type: 'CALL',
      outcome: 'CONNECTED',
      duration: 20,
      notes: 'Booking confirmed! 2 nights in premium suite. Payment received. Sent confirmation email.',
      createdBy: adminUser.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }
  });

  console.log(`  ✓ Created 5 interactions\n`);

  // Create status history
  console.log('Creating status history...');

  await prisma.callStatusHistory.create({
    data: {
      callRequestId: callReq2.id,
      fromStatus: 'NEW',
      toStatus: 'CONTACTED',
      notes: 'First contact made successfully',
      createdBy: adminUser.id,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    }
  });

  await prisma.callStatusHistory.createMany({
    data: [
      {
        callRequestId: callReq3.id,
        fromStatus: 'NEW',
        toStatus: 'CONTACTED',
        notes: 'Initial contact established',
        createdBy: adminUser.id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        callRequestId: callReq3.id,
        fromStatus: 'CONTACTED',
        toStatus: 'QUALIFIED',
        notes: 'Budget confirmed, requirements clear',
        createdBy: adminUser.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]
  });

  await prisma.callStatusHistory.createMany({
    data: [
      {
        callRequestId: callReq6.id,
        fromStatus: 'NEW',
        toStatus: 'CONTACTED',
        notes: 'Customer responded positively',
        createdBy: adminUser.id,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        callRequestId: callReq6.id,
        fromStatus: 'CONTACTED',
        toStatus: 'QUALIFIED',
        notes: 'Budget and dates confirmed',
        createdBy: adminUser.id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        callRequestId: callReq6.id,
        fromStatus: 'QUALIFIED',
        toStatus: 'SCHEDULED',
        notes: 'Site visit scheduled',
        createdBy: adminUser.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        callRequestId: callReq6.id,
        fromStatus: 'SCHEDULED',
        toStatus: 'CONVERTED',
        notes: 'Booking confirmed and payment received',
        createdBy: adminUser.id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]
  });

  console.log(`  ✓ Created status history\n`);

  // Create reviews
  console.log('Creating reviews...');

  const touristGuide = await prisma.user.findFirst({
    where: { role: 'TOURIST_GUIDE' }
  });

  const reviewUserId = touristGuide?.id || adminUser.id;

  await prisma.accommodationReview.createMany({
    data: [
      {
        accommodationId: hotel1.id,
        userId: reviewUserId,
        rating: 5,
        title: 'Absolutely Stunning!',
        review: 'The Grand Mumbai Palace exceeded all expectations. The sea view from our room was breathtaking, staff was incredibly courteous, and the food was exceptional. Will definitely return!',
        isApproved: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        accommodationId: resort1.id,
        userId: reviewUserId,
        rating: 4,
        title: 'Perfect Beach Getaway',
        review: 'Had an amazing time at Paradise Beach Resort. The beach access was convenient, water sports were fun, and the sunset views were magical. Only minor issue was the WiFi speed.',
        isApproved: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        accommodationId: restaurant1.id,
        userId: reviewUserId,
        rating: 5,
        title: 'Culinary Excellence',
        review: 'Spice Garden is a gem! The fusion of traditional and modern flavors is outstanding. The ambiance is perfect for both family dinners and business meetings. Highly recommended!',
        isApproved: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]
  });

  console.log(`  ✓ Created 3 reviews\n`);

  // Summary
  console.log('📊 Seed Summary:');
  console.log('================');
  
  const counts = await Promise.all([
    prisma.accommodation.count(),
    prisma.accommodationCallRequest.count(),
    prisma.callInteraction.count(),
    prisma.callStatusHistory.count(),
    prisma.accommodationReview.count(),
  ]);

  console.log(`✅ Accommodations: ${counts[0]}`);
  console.log(`✅ Call Requests: ${counts[1]}`);
  console.log(`✅ Interactions: ${counts[2]}`);
  console.log(`✅ Status History: ${counts[3]}`);
  console.log(`✅ Reviews: ${counts[4]}`);
  
  console.log('\n🎉 Seed completed successfully!');
  console.log('\nYou can now:');
  console.log('1. View accommodations at: /accommodations');
  console.log('2. Manage accommodations at: /admin/manage-accommodations');
  console.log('3. View CRM dashboard at: /admin/call-requests');
  console.log('4. View reports at: /admin/accommodation-reports');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
