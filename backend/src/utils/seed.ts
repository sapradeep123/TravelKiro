import prisma from '../config/database';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@travelencyclopedia.com' },
    update: {},
    create: {
      email: 'admin@travelencyclopedia.com',
      password: hashedPassword,
      role: 'SITE_ADMIN',
      profile: {
        create: {
          name: 'Site Administrator',
          phone: '+1234567890',
          bio: 'System Administrator',
        },
      },
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample Govt Department user
  const govtPassword = await bcrypt.hash('govt123', 10);
  
  const govtUser = await prisma.user.upsert({
    where: { email: 'tourism@kerala.gov.in' },
    update: {},
    create: {
      email: 'tourism@kerala.gov.in',
      password: govtPassword,
      role: 'GOVT_DEPARTMENT',
      profile: {
        create: {
          name: 'Kerala Tourism Department',
          phone: '+91-471-2321132',
          stateAssignment: 'Kerala',
          bio: 'Official Kerala Tourism Department',
        },
      },
    },
  });

  console.log('✅ Govt Department user created:', govtUser.email);

  // Create sample Tourist Guide
  const guidePassword = await bcrypt.hash('guide123', 10);
  
  const guide = await prisma.user.upsert({
    where: { email: 'guide@example.com' },
    update: {},
    create: {
      email: 'guide@example.com',
      password: guidePassword,
      role: 'TOURIST_GUIDE',
      profile: {
        create: {
          name: 'Rajesh Kumar',
          phone: '+91-9876543210',
          bio: 'Experienced tour guide with 10+ years in Kerala tourism',
        },
      },
    },
  });

  console.log('✅ Tourist Guide user created:', guide.email);

  // Create sample regular user
  const userPassword = await bcrypt.hash('user123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
      profile: {
        create: {
          name: 'John Doe',
          phone: '+1-555-0123',
          bio: 'Travel enthusiast and photographer',
        },
      },
    },
  });

  console.log('✅ Regular user created:', user.email);

  // Create sample locations (approved by admin) - using findFirst to avoid duplicates
  let location1 = await prisma.location.findFirst({
    where: {
      country: 'India',
      state: 'Kerala',
      area: 'Munnar',
    },
  });

  if (!location1) {
    location1 = await prisma.location.create({
      data: {
        country: 'India',
        state: 'Kerala',
        area: 'Munnar',
        description: 'Munnar is a town in the Western Ghats mountain range in Kerala. A hill station and former resort for the British Raj elite, it\'s surrounded by rolling hills dotted with tea plantations established in the late 19th century.',
        images: [
          'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
          'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
        ],
        createdBy: govtUser.id,
        createdByRole: 'GOVT_DEPARTMENT',
        approvalStatus: 'APPROVED',
        approvedBy: admin.id,
        approvedAt: new Date(),
      },
    });
    console.log('✅ Location created: Munnar');
  } else {
    console.log('✅ Location already exists: Munnar');
  }

  let location2 = await prisma.location.findFirst({
    where: {
      country: 'India',
      state: 'Kerala',
      area: 'Alleppey',
    },
  });

  if (!location2) {
    location2 = await prisma.location.create({
      data: {
        country: 'India',
        state: 'Kerala',
        area: 'Alleppey',
        description: 'Alappuzha (or Alleppey) is a city on the Laccadive Sea in the southern Indian state of Kerala. It\'s best known for houseboat cruises along the rustic Kerala backwaters, a network of tranquil canals and lagoons.',
        images: [
          'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800',
          'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
        ],
        createdBy: govtUser.id,
        createdByRole: 'GOVT_DEPARTMENT',
        approvalStatus: 'APPROVED',
        approvedBy: admin.id,
        approvedAt: new Date(),
      },
    });
    console.log('✅ Location created: Alleppey');
  } else {
    console.log('✅ Location already exists: Alleppey');
  }

  let location3 = await prisma.location.findFirst({
    where: {
      country: 'India',
      state: 'Rajasthan',
      area: 'Jaipur',
    },
  });

  if (!location3) {
    location3 = await prisma.location.create({
      data: {
        country: 'India',
        state: 'Rajasthan',
        area: 'Jaipur',
        description: 'Jaipur is the capital of India\'s Rajasthan state. It evokes the royal family that once ruled the region and that, in 1727, founded what is now called the Old City, or "Pink City" for its trademark building color.',
        images: [
          'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
          'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800',
        ],
        createdBy: admin.id,
        createdByRole: 'SITE_ADMIN',
        approvalStatus: 'APPROVED',
        approvedBy: admin.id,
        approvedAt: new Date(),
      },
    });
    console.log('✅ Location created: Jaipur');
  } else {
    console.log('✅ Location already exists: Jaipur');
  }

  // Create sample event
  const event1 = await prisma.event.create({
    data: {
      title: 'Kerala Boat Race Festival',
      description: 'Experience the thrilling snake boat races during the Onam festival. Watch teams of rowers compete in traditional boats on the backwaters.',
      eventType: 'Festival',
      locationId: location2.id,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-09-03'),
      images: [
        'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800',
      ],
      hostId: govtUser.id,
      hostRole: 'GOVT_DEPARTMENT',
      approvalStatus: 'APPROVED',
    },
  });

  console.log('✅ Event created: Kerala Boat Race Festival');

  // Create sample package
  const package1 = await prisma.package.create({
    data: {
      title: 'Kerala Backwaters Experience - 3 Days',
      description: 'Explore the serene backwaters of Kerala with houseboat stays, traditional cuisine, and village visits.',
      duration: 3,
      locationId: location2.id,
      price: 15000,
      images: [
        'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800',
      ],
      hostId: guide.id,
      hostRole: 'TOURIST_GUIDE',
      approvalStatus: 'APPROVED',
      itinerary: {
        create: [
          {
            day: 1,
            title: 'Arrival and Houseboat Check-in',
            description: 'Arrive at Alleppey, board your traditional houseboat, and begin your backwater journey.',
            activities: ['Houseboat boarding', 'Welcome lunch', 'Backwater cruise', 'Sunset viewing'],
          },
          {
            day: 2,
            title: 'Village Tour and Cultural Experience',
            description: 'Visit local villages, witness coir making, and enjoy traditional Kerala cuisine.',
            activities: ['Village walk', 'Coir factory visit', 'Traditional lunch', 'Kathakali performance'],
          },
          {
            day: 3,
            title: 'Departure',
            description: 'Morning cruise and checkout from houseboat.',
            activities: ['Morning tea', 'Final cruise', 'Checkout', 'Departure'],
          },
        ],
      },
    },
  });

  console.log('✅ Package created: Kerala Backwaters Experience');

  // Create sample accommodations
  const hotel1 = await prisma.accommodation.upsert({
    where: { slug: 'taj-gateway-hotel-munnar' },
    update: {},
    create: {
      name: 'The Taj Gateway Hotel',
      slug: 'taj-gateway-hotel-munnar',
      type: 'HOTEL',
      country: 'India',
      state: 'Kerala',
      area: 'Munnar',
      latitude: 10.0889,
      longitude: 77.0595,
      description: 'Luxury hotel nestled in the hills of Munnar with stunning views of tea plantations.',
      phone: ['+91-4865-230504'],
      email: 'munnar@tajhotels.com',
      website: 'https://www.tajhotels.com',
      address: 'Munnar, Kerala 685612, India',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      ],
      videos: [],
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
      keywords: [],
      createdBy: govtUser.id,
      approvalStatus: 'APPROVED',
    },
  });

  console.log('✅ Accommodation created: The Taj Gateway Hotel');

  const restaurant1 = await prisma.accommodation.upsert({
    where: { slug: 'saravana-bhavan-alleppey' },
    update: {},
    create: {
      name: 'Saravana Bhavan',
      slug: 'saravana-bhavan-alleppey',
      type: 'RESTAURANT',
      country: 'India',
      state: 'Kerala',
      area: 'Alleppey',
      latitude: 9.4981,
      longitude: 76.3388,
      description: 'Authentic South Indian vegetarian restaurant serving traditional Kerala cuisine.',
      phone: ['+91-477-2243866'],
      email: 'info@saravanabhavan.com',
      address: 'Beach Road, Alleppey, Kerala 688012',
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      ],
      videos: [],
      amenities: ['AC', 'Parking'],
      keywords: [],
      dietTypes: ['VEGETARIAN'],
      cuisineTypes: ['South Indian', 'Kerala'],
      createdBy: guide.id,
      approvalStatus: 'APPROVED',
    },
  });

  console.log('✅ Accommodation created: Saravana Bhavan');

  // Create sample community post
  const post1 = await prisma.communityPost.create({
    data: {
      userId: user.id,
      locationId: location1.id,
      caption: 'Amazing sunrise view from Munnar! The tea plantations look magical in the morning mist. 🌄☕',
      mediaUrls: [
        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
      ],
      mediaTypes: ['IMAGE'],
    },
  });

  console.log('✅ Community post created');

  // Create sample group travel
  const groupTravel1 = await prisma.groupTravel.create({
    data: {
      title: 'Rajasthan Heritage Tour - Group of 10',
      description: 'Looking for a group of 10 people to explore the heritage sites of Rajasthan including Jaipur, Udaipur, and Jodhpur.',
      locationId: location3.id,
      travelDate: new Date('2024-12-15'),
      expiryDate: new Date('2024-11-30'),
      creatorId: user.id,
      status: 'OPEN',
    },
  });

  console.log('✅ Group travel created: Rajasthan Heritage Tour');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@travelencyclopedia.com / admin123');
  console.log('Govt Dept: tourism@kerala.gov.in / govt123');
  console.log('Tourist Guide: guide@example.com / guide123');
  console.log('User: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
