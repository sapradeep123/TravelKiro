import prisma from '../config/database';
import path from 'path';
import fs from 'fs';

async function resetCommunityPosts() {
  console.log('🗑️  Deleting all existing community posts...\n');

  try {
    // Delete all posts (cascades to comments, likes, etc.)
    await prisma.communityPost.deleteMany({});
    console.log('✅ All posts deleted\n');

    // Get users
    const adminUser = await prisma.user.findFirst({
      where: { role: 'SITE_ADMIN' }
    });

    const regularUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      take: 3
    });

    if (!adminUser) {
      throw new Error('No admin user found. Please run the main seed first.');
    }

    // Get some locations
    const locations = await prisma.location.findMany({
      take: 5
    });

    // Check for existing images in uploads/community
    const uploadDir = path.join(__dirname, '../../uploads/community');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('⚠️  No images found in uploads/community directory');
      console.log('📝 Please upload images using the app\'s upload feature first\n');
      return;
    }

    const existingImages = fs.readdirSync(uploadDir)
      .filter(file => file.match(/\.(jpg|jpeg|png)$/i))
      .filter(file => !file.includes('office')); // Exclude test office images

    if (existingImages.length === 0) {
      console.log('⚠️  No valid images found in uploads/community directory');
      console.log('📝 Please upload images using the app\'s upload feature first\n');
      return;
    }

    console.log(`📸 Found ${existingImages.length} images in uploads/community\n`);

    // Use the first 5 images (or all if less than 5)
    const imagesToUse = existingImages.slice(0, 5);

    console.log('📝 Creating sample posts with local images...\n');

    // Create posts with the local images
    const posts = [
      {
        userId: adminUser.id,
        locationId: locations[0]?.id,
        caption: 'Amazing sunrise view from Munnar! The tea plantations look magical in the morning mist. 🌄☕ #Kerala #TeaGardens #Travel',
        mediaUrls: [`/uploads/community/${imagesToUse[0]}`],
        mediaTypes: ['IMAGE']
      },
      {
        userId: regularUsers[0]?.id || adminUser.id,
        locationId: locations[1]?.id,
        caption: 'The Taj Mahal at sunset - words cannot describe this beauty! 😍 A must-visit for everyone. #TajMahal #Agra #India',
        mediaUrls: imagesToUse[1] ? [`/uploads/community/${imagesToUse[1]}`] : [`/uploads/community/${imagesToUse[0]}`],
        mediaTypes: ['IMAGE']
      },
      {
        userId: regularUsers[1]?.id || adminUser.id,
        customCountry: 'India',
        customState: 'Himachal Pradesh',
        customArea: 'Manali',
        caption: 'Trekking through the Himalayas! The mountain air and stunning views make every step worth it. 🏔️ #Adventure #Mountains #Trekking',
        mediaUrls: imagesToUse[2] ? [`/uploads/community/${imagesToUse[2]}`] : [`/uploads/community/${imagesToUse[0]}`],
        mediaTypes: ['IMAGE']
      },
      {
        userId: regularUsers[2]?.id || adminUser.id,
        customCountry: 'India',
        customState: 'Goa',
        customArea: 'Palolem Beach',
        caption: 'Beach vibes in Goa! 🌴🌊 Perfect place to relax and unwind. #BeachLife #Goa #Vacation',
        mediaUrls: imagesToUse[3] ? [`/uploads/community/${imagesToUse[3]}`] : [`/uploads/community/${imagesToUse[0]}`],
        mediaTypes: ['IMAGE']
      },
      {
        userId: adminUser.id,
        locationId: locations[2]?.id,
        caption: 'Exploring the Pink City! Jaipur never fails to amaze with its stunning architecture and vibrant culture. 🏰 #Jaipur #Rajasthan #Heritage',
        mediaUrls: imagesToUse[4] ? [`/uploads/community/${imagesToUse[4]}`] : [`/uploads/community/${imagesToUse[0]}`],
        mediaTypes: ['IMAGE']
      }
    ];

    for (const postData of posts) {
      const post = await prisma.communityPost.create({
        data: postData as any,
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  name: true,
                  avatar: true
                }
              }
            }
          }
        }
      });
      console.log(`✅ Created post: "${post.caption.substring(0, 50)}..."`);
    }

    console.log('\n🎉 Community posts reset successfully!');
    console.log(`📊 Created ${posts.length} posts using ${imagesToUse.length} local images`);
    console.log('\n✨ All images are stored locally and accessible!');
    console.log('\n💡 To add more images, use the photo upload feature in the app');

  } catch (error) {
    console.error('\n❌ Error resetting community posts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resetCommunityPosts()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
