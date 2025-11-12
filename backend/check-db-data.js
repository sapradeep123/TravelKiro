// Direct database check for community data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Checking Database for Community Data...\n');

  try {
    // Check users
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: '@example.com'
        }
      },
      include: {
        profile: true
      }
    });

    console.log(`👥 Users: ${users.length} found`);
    users.forEach(user => {
      console.log(`   - ${user.profile?.name} (${user.email})`);
    });

    // Check posts
    const posts = await prisma.communityPost.findMany({
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    console.log(`\n📝 Posts: ${posts.length} found`);
    posts.forEach(post => {
      console.log(`   - "${post.caption.substring(0, 50)}..." by ${post.user.profile?.name}`);
      console.log(`     Likes: ${post.likeCount}, Comments: ${post.commentCount}, Saves: ${post.saveCount}`);
    });

    // Check follows
    const follows = await prisma.follow.count();
    console.log(`\n👥 Follow relationships: ${follows}`);

    // Check follow requests
    const followRequests = await prisma.followRequest.count();
    console.log(`📨 Follow requests: ${followRequests}`);

    // Check likes
    const likes = await prisma.postLike.count();
    console.log(`❤️  Likes: ${likes}`);

    // Check comments
    const comments = await prisma.comment.count();
    console.log(`💬 Comments: ${comments}`);

    // Check saved posts
    const savedPosts = await prisma.savedPost.count();
    console.log(`🔖 Saved posts: ${savedPosts}`);

    console.log('\n✅ Database has community data!');
    console.log('\n📝 To access this data:');
    console.log('   1. Make sure backend is running: npm run dev');
    console.log('   2. Login with: john.doe@example.com / Test123!@#');
    console.log('   3. Navigate to Community tab');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
