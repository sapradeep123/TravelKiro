import prisma from '../config/database';

async function checkPosts() {
  const posts = await prisma.communityPost.findMany({
    take: 3,
    select: {
      id: true,
      caption: true,
      mediaUrls: true
    }
  });

  console.log('Posts in database:');
  posts.forEach((post, i) => {
    console.log(`\nPost ${i + 1}:`);
    console.log('Caption:', post.caption.substring(0, 50));
    console.log('Media URLs:', post.mediaUrls);
  });

  await prisma.$disconnect();
}

checkPosts();
