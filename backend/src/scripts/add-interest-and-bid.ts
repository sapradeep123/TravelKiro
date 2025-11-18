import prisma from '../config/database';

async function addInterestAndBid() {
  console.log('🌱 Adding user interest and creating sample bid view...');

  try {
    // Find the regular user and tourist guide
    const regularUser = await prisma.user.findFirst({
      where: { role: 'USER' },
      include: { profile: true },
    });

    const touristGuide = await prisma.user.findFirst({
      where: { role: 'TOURIST_GUIDE' },
      include: { profile: true },
    });

    if (!regularUser || !touristGuide) {
      console.log('❌ Users not found');
      return;
    }

    // Find the first group travel
    const groupTravel = await prisma.groupTravel.findFirst({
      where: { status: 'OPEN' },
    });

    if (!groupTravel) {
      console.log('❌ No group travel found');
      return;
    }

    console.log('✅ Found group travel:', groupTravel.title);

    // Check if user already expressed interest
    const existingInterest = await prisma.groupTravelInterest.findUnique({
      where: {
        groupTravelId_userId: {
          groupTravelId: groupTravel.id,
          userId: regularUser.id,
        },
      },
    });

    if (!existingInterest) {
      // Add user interest
      await prisma.groupTravelInterest.create({
        data: {
          groupTravelId: groupTravel.id,
          userId: regularUser.id,
        },
      });
      console.log('✅ Added user interest');
    } else {
      console.log('✅ User already interested');
    }

    // Check if there are any bids
    const existingBids = await prisma.travelBid.findMany({
      where: { groupTravelId: groupTravel.id },
    });

    console.log(`✅ Found ${existingBids.length} existing bids`);

    console.log('\n✅ Setup complete!');
    console.log('\nNow you can:');
    console.log('1. Login as regular user to see bids');
    console.log('2. View the group travel details');
    console.log('3. See how bids are displayed');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addInterestAndBid();
