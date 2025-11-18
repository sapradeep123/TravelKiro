import prisma from '../config/database';

async function seedGroupTravel() {
  console.log('🌱 Seeding group travel data...');

  try {
    // Find or create users
    const regularUser = await prisma.user.findFirst({
      where: { role: 'USER' },
      include: { profile: true },
    });

    const touristGuide = await prisma.user.findFirst({
      where: { role: 'TOURIST_GUIDE' },
      include: { profile: true },
    });

    if (!regularUser || !touristGuide) {
      console.log('❌ Please create users first using the seed endpoint');
      return;
    }

    console.log('✅ Found users:', regularUser.email, touristGuide.email);

    // Create group travels
    const travelDate1 = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const expiryDate1 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const groupTravel1 = await prisma.groupTravel.create({
      data: {
        title: 'Weekend Trip to Manali',
        description: 'Looking for adventure enthusiasts to join a weekend trip to Manali. We will explore Solang Valley, Rohtang Pass, and local markets.',
        customCountry: 'India',
        customState: 'Himachal Pradesh',
        customArea: 'Manali',
        travelDate: travelDate1,
        expiryDate: expiryDate1,
        creatorId: regularUser.id,
        status: 'OPEN',
      },
    });

    console.log('✅ Created group travel:', groupTravel1.title);

    const travelDate2 = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
    const expiryDate2 = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    const groupTravel2 = await prisma.groupTravel.create({
      data: {
        title: 'Goa Beach Vacation',
        description: 'Planning a relaxing beach vacation in Goa. Looking for people who love beaches, water sports, and nightlife.',
        customCountry: 'India',
        customState: 'Goa',
        customArea: 'North Goa',
        travelDate: travelDate2,
        expiryDate: expiryDate2,
        creatorId: regularUser.id,
        status: 'OPEN',
      },
    });

    console.log('✅ Created group travel:', groupTravel2.title);

    // Create bids
    const bid1 = await prisma.travelBid.create({
      data: {
        groupTravelId: groupTravel1.id,
        guideId: touristGuide.id,
        numberOfDays: 3,
        accommodationDetails: '3-star hotels with mountain view, comfortable rooms with heating',
        foodDetails: 'Breakfast and dinner included, local Himachali cuisine, vegetarian and non-vegetarian options',
        transportDetails: 'Private cab for entire trip, pickup from Chandigarh, all local sightseeing included',
        totalCost: 15000,
        approvalStatus: 'PENDING',
        canContact: false,
        dailyItinerary: {
          create: [
            {
              day: 1,
              activities: 'Arrival at Manali, check-in at hotel, evening visit to Mall Road and local market',
              meals: 'Dinner at hotel',
              accommodation: 'Hotel Mountain View (3-star)',
            },
            {
              day: 2,
              activities: 'Full day Solang Valley tour, adventure sports (paragliding, zorbing), visit to Rohtang Pass',
              meals: 'Breakfast and dinner at hotel, lunch at Solang Valley',
              accommodation: 'Hotel Mountain View (3-star)',
            },
            {
              day: 3,
              activities: 'Morning visit to Hadimba Temple, shopping at Mall Road, departure',
              meals: 'Breakfast at hotel',
              accommodation: 'N/A',
            },
          ],
        },
      },
    });

    console.log('✅ Created bid for Manali trip');

    const bid2 = await prisma.travelBid.create({
      data: {
        groupTravelId: groupTravel2.id,
        guideId: touristGuide.id,
        numberOfDays: 4,
        accommodationDetails: 'Beach resort with sea view, swimming pool, all modern amenities',
        foodDetails: 'All meals included, seafood specialties, continental and Indian cuisine',
        transportDetails: 'Airport pickup and drop, AC vehicle for all sightseeing',
        totalCost: 20000,
        approvalStatus: 'PENDING',
        canContact: false,
        dailyItinerary: {
          create: [
            {
              day: 1,
              activities: 'Arrival at Goa airport, check-in at resort, evening beach walk',
              meals: 'Lunch and dinner at resort',
              accommodation: 'Beach Paradise Resort',
            },
            {
              day: 2,
              activities: 'Water sports at Calangute Beach, visit to Fort Aguada, evening at Baga Beach',
              meals: 'All meals at resort',
              accommodation: 'Beach Paradise Resort',
            },
            {
              day: 3,
              activities: 'Dudhsagar Falls trip, spice plantation visit, evening cruise on Mandovi River',
              meals: 'All meals included',
              accommodation: 'Beach Paradise Resort',
            },
            {
              day: 4,
              activities: 'Morning beach time, shopping at Anjuna Flea Market, departure',
              meals: 'Breakfast at resort',
              accommodation: 'N/A',
            },
          ],
        },
      },
    });

    console.log('✅ Created bid for Goa trip');

    console.log('\n✅ Group travel seed data created successfully!');
    console.log('\nSummary:');
    console.log('- 2 group travels created');
    console.log('- 2 bids submitted');
    console.log('\nYou can now test the group travel feature!');
  } catch (error) {
    console.error('❌ Error seeding group travel data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedGroupTravel();
