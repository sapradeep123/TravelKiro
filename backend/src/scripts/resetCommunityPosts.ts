import prisma from '../config/database';
import path from 'path';
import fs from 'fs';
import https from 'https';
import sharp from 'sharp';

async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

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

    console.log('📥 Downloading and processing sample images...\n');

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads/community');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Sample images from Unsplash (travel-related)
    const sampleImages = [
      {
        url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200',
        name: 'taj-mahal.jpg'
      },
      {
        url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200',
        name: 'kerala-backwaters.jpg'
      },
      {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
        name: 'mountains.jpg'
      },
      {
        url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200',
        name: 'goa-beach.jpg'
      },
      {
        url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200',
        name: 'jaipur-palace.jpg'
      }
    ];

    const processedImages: string[] = [];

    for (const img of sampleImages) {
      try {
        const tempPath = path.join(uploadDir, `temp-${img.name}`);
        const finalPath = path.join(uploadDir, img.name);

        console.log(`  Downloading ${img.name}...`);
        await downloadImage(img.url, tempPath);

        console.log(`  Processing ${img.name}...`);
        // Optimize the image
        await sharp(tempPath)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({
            quality: 85,
            progressive: true
          })
          .toFile(finalPath);

        // Delete temp file
        fs.unlinkSync(tempPath);

        processedImages.push(`/uploads/community/${img.name}`);
        console.log(`  ✅ ${img.name} ready\n`);
      } catch (error) {
        console.error(`  ❌ Failed to process ${img.name}:`, error);
      }
    }

    if (processedImages.length === 0) {
      throw new Error('No images were successfully processed');
    }

    console.log('📝 Creating sample posts with real images...\n');

    // Create posts with the downloaded images
    const posts = [
      {
        userId: adminUser.id,
        locationId: locations[0]?.id,
        caption: 'Amazing sunrise view from Munnar! The tea plantations look magical in the morning mist. 🌄☕ #Kerala #TeaGardens #Travel',
        mediaUrls: [processedImages[1]],
        mediaTypes: ['IMAGE']
      },
      {
        userId: regularUsers[0]?.id || adminUser.id,
        locationId: locations[1]?.id,
        caption: 'The Taj Mahal at sunset - words cannot describe this beauty! 😍 A must-visit for everyone. #TajMahal #Agra #India',
        mediaUrls: [processedImages[0]],
        mediaTypes: ['IMAGE']
      },
      {
        userId: regularUsers[1]?.id || adminUser.id,
        customCountry: 'India',
        customState: 'Himachal Pradesh',
        customArea: 'Manali',
        caption: 'Trekking through the Himalayas! The mountain air and stunning views make every step worth it. 🏔️ #Adventure #Mountains #Trekking',
        mediaUrls: [processedImages[2]],
        mediaTypes: ['IMAGE']
      },
      {
        userId: regularUsers[2]?.id || adminUser.id,
        customCountry: 'India',
        customState: 'Goa',
        customArea: 'Palolem Beach',
        caption: 'Beach vibes in Goa! 🌴🌊 Perfect place to relax and unwind. #BeachLife #Goa #Vacation',
        mediaUrls: [processedImages[3]],
        mediaTypes: ['IMAGE']
      },
      {
        userId: adminUser.id,
        locationId: locations[2]?.id,
        caption: 'Exploring the Pink City! Jaipur never fails to amaze with its stunning architecture and vibrant culture. 🏰 #Jaipur #Rajasthan #Heritage',
        mediaUrls: [processedImages[4]],
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
    console.log(`📊 Created ${posts.length} posts with ${processedImages.length} images`);
    console.log('\n✨ All images are now properly stored and accessible!');

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
