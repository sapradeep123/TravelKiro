import prisma from '../config/database';
import bcrypt from 'bcryptjs';

async function seedCommunity() {
  console.log('🌱 Starting Community Module Seeding...\n');

  try {
    // Step 1: Create sample users
    console.log('👥 Creating sample users...');
    
    const hashedPassword = await bcrypt.hash('Test123!@#', 10);
    
    const users = [];
    
    // User 1: Regular user with public profile
    const user1 = await prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        profile: {
          create: {
            name: 'John Doe',
            bio: 'Travel enthusiast exploring the world 🌍 | Photography lover 📸',
            avatar: 'https://i.pravatar.cc/150?img=12',
            isPrivate: false,
          },
        },
      },
      include: { profile: true },
    });
    users.push(user1);
    console.log(`✅ Created user: ${user1.profile?.name} (${user1.email})`);

    // User 2: Regular user with private profile
    const user2 = await prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        profile: {
          create: {
            name: 'Jane Smith',
            bio: 'Adventure seeker | Mountain lover ⛰️ | Living life one trip at a time',
            avatar: 'https://i.pravatar.cc/150?img=5',
            isPrivate: true,
          },
        },
      },
      include: { profile: true },
    });
    users.push(user2);
    console.log(`✅ Created user: ${user2.profile?.name} (${user2.email})`);

    // User 3: Tourist Guide
    const user3 = await prisma.user.create({
      data: {
        email: 'raj.kumar@example.com',
        password: hashedPassword,
        role: 'TOURIST_GUIDE',
        isActive: true,
        profile: {
          create: {
            name: 'Raj Kumar',
            bio: 'Professional tour guide | 10+ years experience | Specializing in heritage tours',
            avatar: 'https://i.pravatar.cc/150?img=33',
            isPrivate: false,
          },
        },
      },
      include: { profile: true },
    });
    users.push(user3);
    console.log(`✅ Created user: ${user3.profile?.name} (${user3.email})`);

    // User 4: Influencer
    const user4 = await prisma.user.create({
      data: {
        email: 'priya.sharma@example.com',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        profile: {
          create: {
            name: 'Priya Sharma',
            bio: 'Travel Blogger | Content Creator | Sharing my journey across India 🇮🇳',
            avatar: 'https://i.pravatar.cc/150?img=9',
            isPrivate: false,
            isInfluencer: true,
          },
        },
      },
      include: { profile: true },
    });
    users.push(user4);
    console.log(`✅ Created user: ${user4.profile?.name} (${user4.email})`);

    // User 5: Celebrity
    const user5 = await prisma.user.create({
      data: {
        email: 'amit.verma@example.com',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        profile: {
          create: {
            name: 'Amit Verma',
            bio: 'Actor | Traveler | Exploring hidden gems of India',
            avatar: 'https://i.pravatar.cc/150?img=15',
            isPrivate: false,
            isCelebrity: true,
          },
        },
      },
      include: { profile: true },
    });
    users.push(user5);
    console.log(`✅ Created user: ${user5.profile?.name} (${user5.email})`);

    console.log(`\n✅ Created ${users.length} users\n`);

    // Step 2: Get existing locations or create sample ones
    console.log('📍 Fetching locations...');
    let locations = await prisma.location.findMany({
      take: 5,
      where: {
        approvalStatus: 'APPROVED',
      },
    });

    if (locations.length === 0) {
      console.log('⚠️  No approved locations found. Creating sample locations...');
      
      const location1 = await prisma.location.create({
        data: {
          country: 'India',
          state: 'Rajasthan',
          area: 'Jaipur',
          description: 'The Pink City - Known for its stunning palaces and forts',
          images: [
            'https://images.unsplash.com/photo-1599661046289-e31897846e41',
            'https://images.unsplash.com/photo-1477587458883-47145ed94245',
          ],
          latitude: 26.9124,
          longitude: 75.7873,
          attractions: ['Hawa Mahal', 'Amber Fort', 'City Palace', 'Jantar Mantar'],
          createdBy: user1.id,
          createdByRole: 'USER',
          approvalStatus: 'APPROVED',
        },
      });
      locations.push(location1);

      const location2 = await prisma.location.create({
        data: {
          country: 'India',
          state: 'Kerala',
          area: 'Munnar',
          description: 'Hill station known for tea plantations and scenic beauty',
          images: [
            'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
          ],
          latitude: 10.0889,
          longitude: 77.0595,
          attractions: ['Tea Gardens', 'Eravikulam National Park', 'Mattupetty Dam'],
          createdBy: user2.id,
          createdByRole: 'USER',
          approvalStatus: 'APPROVED',
        },
      });
      locations.push(location2);

      console.log(`✅ Created ${locations.length} sample locations`);
    } else {
      console.log(`✅ Found ${locations.length} existing locations`);
    }

    // Step 3: Create community posts
    console.log('\n📝 Creating community posts...');
    
    const posts = [];

    // Post 1: John's post from Jaipur
    const post1 = await prisma.communityPost.create({
      data: {
        userId: user1.id,
        locationId: locations[0]?.id,
        caption: 'Amazing sunset at Hawa Mahal! The Pink City never disappoints 🌅 #Jaipur #Travel #India',
        mediaUrls: [
          'https://images.unsplash.com/photo-1599661046289-e31897846e41',
          'https://images.unsplash.com/photo-1477587458883-47145ed94245',
        ],
        mediaTypes: ['IMAGE', 'IMAGE'],
      },
    });
    posts.push(post1);
    console.log(`✅ Created post by ${user1.profile?.name}`);

    // Post 2: Jane's post with custom location
    const post2 = await prisma.communityPost.create({
      data: {
        userId: user2.id,
        customCountry: 'India',
        customState: 'Himachal Pradesh',
        customArea: 'Manali',
        caption: 'Trekking through the Himalayas! Best decision ever 🏔️ #Adventure #Mountains #Manali',
        mediaUrls: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
        ],
        mediaTypes: ['IMAGE'],
      },
    });
    posts.push(post2);
    console.log(`✅ Created post by ${user2.profile?.name}`);

    // Post 3: Raj's guide post
    const post3 = await prisma.communityPost.create({
      data: {
        userId: user3.id,
        locationId: locations[0]?.id,
        caption: 'Pro tip: Visit Amber Fort early morning to avoid crowds and catch the best light for photos! 📸 #TravelTips #JaipurGuide',
        mediaUrls: [
          'https://images.unsplash.com/photo-1524492412937-b28074a5d7da',
        ],
        mediaTypes: ['IMAGE'],
      },
    });
    posts.push(post3);
    console.log(`✅ Created post by ${user3.profile?.name}`);

    // Post 4: Priya's influencer post
    const post4 = await prisma.communityPost.create({
      data: {
        userId: user4.id,
        locationId: locations[1]?.id || locations[0]?.id,
        caption: 'Tea time in Munnar! ☕ The rolling hills and fresh air make this place magical. Swipe for more pics! #MunnarDiaries #TeaGardens #TravelBlogger',
        mediaUrls: [
          'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
          'https://images.unsplash.com/photo-1587135941948-670b381f08ce',
        ],
        mediaTypes: ['IMAGE', 'IMAGE', 'IMAGE'],
      },
    });
    posts.push(post4);
    console.log(`✅ Created post by ${user4.profile?.name}`);

    // Post 5: Amit's celebrity post
    const post5 = await prisma.communityPost.create({
      data: {
        userId: user5.id,
        customCountry: 'India',
        customState: 'Goa',
        customArea: 'Palolem Beach',
        caption: 'Taking a break from the city life. Goa vibes 🌴🌊 #BeachLife #Goa #Vacation',
        mediaUrls: [
          'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
        ],
        mediaTypes: ['IMAGE'],
      },
    });
    posts.push(post5);
    console.log(`✅ Created post by ${user5.profile?.name}`);

    // Post 6: John's video post
    const post6 = await prisma.communityPost.create({
      data: {
        userId: user1.id,
        customCountry: 'India',
        customState: 'Maharashtra',
        customArea: 'Mumbai',
        caption: 'Street food tour in Mumbai! The flavors are incredible 🍛 #MumbaiFood #StreetFood #Foodie',
        mediaUrls: [
          'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7',
        ],
        mediaTypes: ['VIDEO'],
      },
    });
    posts.push(post6);
    console.log(`✅ Created post by ${user1.profile?.name}`);

    console.log(`\n✅ Created ${posts.length} posts\n`);

    // Step 4: Create interactions (likes, comments, saves)
    console.log('💬 Creating interactions...');

    // User 2 likes User 1's first post
    await prisma.postLike.create({
      data: {
        postId: post1.id,
        userId: user2.id,
      },
    });
    await prisma.communityPost.update({
      where: { id: post1.id },
      data: { likeCount: { increment: 1 } },
    });

    // User 3 likes User 1's first post
    await prisma.postLike.create({
      data: {
        postId: post1.id,
        userId: user3.id,
      },
    });
    await prisma.communityPost.update({
      where: { id: post1.id },
      data: { likeCount: { increment: 1 } },
    });

    // User 4 likes User 1's first post
    await prisma.postLike.create({
      data: {
        postId: post1.id,
        userId: user4.id,
      },
    });
    await prisma.communityPost.update({
      where: { id: post1.id },
      data: { likeCount: { increment: 1 } },
    });

    console.log('✅ Created likes');

    // Add comments
    const comment1 = await prisma.comment.create({
      data: {
        postId: post1.id,
        userId: user2.id,
        text: 'Wow! This looks amazing! 😍',
      },
    });
    await prisma.communityPost.update({
      where: { id: post1.id },
      data: { commentCount: { increment: 1 } },
    });

    const comment2 = await prisma.comment.create({
      data: {
        postId: post1.id,
        userId: user3.id,
        text: 'Great shot! The lighting is perfect 📸',
      },
    });
    await prisma.communityPost.update({
      where: { id: post1.id },
      data: { commentCount: { increment: 1 } },
    });

    const comment3 = await prisma.comment.create({
      data: {
        postId: post4.id,
        userId: user1.id,
        text: 'Added to my bucket list! Thanks for sharing 🙏',
      },
    });
    await prisma.communityPost.update({
      where: { id: post4.id },
      data: { commentCount: { increment: 1 } },
    });

    console.log('✅ Created comments');

    // Save posts
    await prisma.savedPost.create({
      data: {
        userId: user1.id,
        postId: post4.id,
      },
    });
    await prisma.communityPost.update({
      where: { id: post4.id },
      data: { saveCount: { increment: 1 } },
    });

    await prisma.savedPost.create({
      data: {
        userId: user2.id,
        postId: post3.id,
      },
    });
    await prisma.communityPost.update({
      where: { id: post3.id },
      data: { saveCount: { increment: 1 } },
    });

    console.log('✅ Created saved posts');

    // Step 5: Create follow relationships
    console.log('\n👥 Creating follow relationships...');

    // User 1 follows User 3 (guide)
    await prisma.follow.create({
      data: {
        followerId: user1.id,
        followingId: user3.id,
      },
    });
    await prisma.userProfile.update({
      where: { userId: user3.id },
      data: { followerCount: { increment: 1 } },
    });
    await prisma.userProfile.update({
      where: { userId: user1.id },
      data: { followingCount: { increment: 1 } },
    });

    // User 1 follows User 4 (influencer)
    await prisma.follow.create({
      data: {
        followerId: user1.id,
        followingId: user4.id,
      },
    });
    await prisma.userProfile.update({
      where: { userId: user4.id },
      data: { followerCount: { increment: 1 } },
    });
    await prisma.userProfile.update({
      where: { userId: user1.id },
      data: { followingCount: { increment: 1 } },
    });

    // User 3 follows User 4
    await prisma.follow.create({
      data: {
        followerId: user3.id,
        followingId: user4.id,
      },
    });
    await prisma.userProfile.update({
      where: { userId: user4.id },
      data: { followerCount: { increment: 1 } },
    });
    await prisma.userProfile.update({
      where: { userId: user3.id },
      data: { followingCount: { increment: 1 } },
    });

    // User 5 follows User 4
    await prisma.follow.create({
      data: {
        followerId: user5.id,
        followingId: user4.id,
      },
    });
    await prisma.userProfile.update({
      where: { userId: user4.id },
      data: { followerCount: { increment: 1 } },
    });
    await prisma.userProfile.update({
      where: { userId: user5.id },
      data: { followingCount: { increment: 1 } },
    });

    console.log('✅ Created follow relationships');

    // Step 6: Create a follow request for private profile
    console.log('\n📨 Creating follow request...');
    
    await prisma.followRequest.create({
      data: {
        followerId: user3.id,
        followingId: user2.id,
        status: 'PENDING',
      },
    });

    console.log('✅ Created follow request (User 3 → User 2)');

    // Step 7: Update post counts
    console.log('\n📊 Updating post counts...');
    
    for (const user of users) {
      const postCount = await prisma.communityPost.count({
        where: { userId: user.id },
      });
      
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: { postCount },
      });
    }

    console.log('✅ Updated post counts');

    // Print summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    SEEDING COMPLETE                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Summary:');
    console.log(`   Users created: ${users.length}`);
    console.log(`   Posts created: ${posts.length}`);
    console.log(`   Locations used: ${locations.length}`);
    console.log(`   Likes created: 3`);
    console.log(`   Comments created: 3`);
    console.log(`   Saved posts: 2`);
    console.log(`   Follow relationships: 4`);
    console.log(`   Follow requests: 1`);

    console.log('\n👤 Test Users (Password: Test123!@#):');
    console.log('   1. john.doe@example.com - Regular user (public)');
    console.log('   2. jane.smith@example.com - Regular user (private)');
    console.log('   3. raj.kumar@example.com - Tourist Guide');
    console.log('   4. priya.sharma@example.com - Influencer');
    console.log('   5. amit.verma@example.com - Celebrity');

    console.log('\n✅ You can now test the community module with these users!');
    console.log('   Login with any of the above credentials to explore the features.\n');

  } catch (error) {
    console.error('\n❌ Error seeding community data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedCommunity()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
